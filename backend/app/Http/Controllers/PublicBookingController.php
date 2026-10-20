<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Package;
use App\Models\Schedule;
use App\Models\User;
use App\Services\DefaultScheduleAvailability;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PublicBookingController extends Controller
{
    public function packages(): JsonResponse
    {
        return response()->json([
            'packages' => Package::query()
                ->where('package_status', 'active')
                ->orderBy('package_name')
                ->get(['package_id', 'package_name', 'description', 'price', 'duration_minutes', 'inclusions', 'pricing_type']),
        ]);
    }

    public function availability(DefaultScheduleAvailability $availability): JsonResponse
    {
        $today = today();
        $now = now();
        $availability->ensureThrough($today->copy()->addMonths(6)->toImmutable());

        return response()->json([
            'schedules' => Schedule::query()
                ->where('status', 'available')
                ->whereNotExists(function ($query): void {
                    $query->selectRaw('1')
                        ->from('blocked_schedule_dates')
                        ->whereRaw('DATE(blocked_schedule_dates.schedule_date) = DATE(schedules.schedule_date)');
                })
                ->whereNotExists(function ($query): void {
                    $query->selectRaw('1')
                        ->from('schedules as date_blocks')
                        ->whereColumn('date_blocks.schedule_date', 'schedules.schedule_date')
                        ->where('date_blocks.status', 'blocked')
                        ->whereTime('date_blocks.start_time', '00:00:00')
                        ->whereTime('date_blocks.end_time', '23:59:00');
                })
                ->whereDate('schedule_date', '>=', $today)
                ->whereDate('schedule_date', '<=', $today->copy()->addMonths(6))
                ->where(function ($query) use ($today, $now): void {
                    $query->whereDate('schedule_date', '>', $today)
                        ->orWhere(function ($todayQuery) use ($today, $now): void {
                            $todayQuery->whereDate('schedule_date', $today)
                                ->where('start_time', '>', $now->format('H:i:s'));
                        });
                })
                ->orderBy('schedule_date')
                ->orderBy('start_time')
                ->get(['schedule_id', 'schedule_date', 'start_time', 'end_time']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'package_id' => ['required', 'integer', Rule::exists('packages', 'package_id')->where('package_status', 'active')],
            'schedule_id' => ['required', 'integer', 'exists:schedules,schedule_id'],
            'requests' => ['nullable', 'string', 'max:10000'],
        ]);

        $booking = DB::transaction(function () use ($validated): Booking {
            $schedule = Schedule::query()->lockForUpdate()->findOrFail($validated['schedule_id']);
            if (
                $schedule->status !== 'available'
                || $this->scheduleHasPassed($schedule)
                || $this->isDateBlocked($schedule)
            ) {
                throw ValidationException::withMessages([
                    'schedule_id' => ['That time is no longer available. Please choose another slot.'],
                ]);
            }

            $package = Package::query()
                ->where('package_status', 'active')
                ->findOrFail($validated['package_id']);
            if (! $package->fitsSchedule($schedule)) {
                throw ValidationException::withMessages([
                    'schedule_id' => ['This package requires a longer time slot. Please choose another time.'],
                ]);
            }

            $customer = User::query()
                ->whereRaw('LOWER(email) = ?', [Str::lower($validated['email'])])
                ->lockForUpdate()
                ->first();

            if ($customer && $customer->role !== 'Customer') {
                throw ValidationException::withMessages([
                    'email' => ['This email address cannot be used for a customer booking.'],
                ]);
            }

            if (! $customer) {
                $customer = User::query()->create([
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'email' => $validated['email'],
                    'password' => Hash::make(Str::random(64)),
                    'role' => 'Customer',
                ]);
            }

            $booking = Booking::query()->create([
                'customer_id' => $customer->id,
                'package_id' => $package->package_id,
                'schedule_id' => $schedule->schedule_id,
                'requests' => $validated['requests'] ?? '',
                'total_price' => $package->priceForSchedule($schedule),
                'booking_status' => 'pending',
                'booked_at' => now(),
            ]);

            $schedule->update(['status' => 'booked']);

            return $booking;
        });

        return response()->json([
            'message' => 'Your booking request has been submitted for review.',
            'booking' => [
                'booking_id' => $booking->booking_id,
                'booking_status' => $booking->booking_status,
                'package' => $booking->package()->first(['package_id', 'package_name', 'price']),
                'schedule' => $booking->schedule()->first(['schedule_id', 'schedule_date', 'start_time', 'end_time']),
            ],
        ], 201);
    }

    private function scheduleHasPassed(Schedule $schedule): bool
    {
        $date = $schedule->schedule_date->toDateString();

        return $date < today()->toDateString()
            || ($date === today()->toDateString() && $schedule->start_time->format('H:i:s') <= now()->format('H:i:s'));
    }

    private function isDateBlocked(Schedule $schedule): bool
    {
        return DB::table('blocked_schedule_dates')
            ->whereDate('schedule_date', $schedule->schedule_date)
            ->exists()
            || Schedule::query()
                ->whereDate('schedule_date', $schedule->schedule_date)
                ->where('status', 'blocked')
                ->whereTime('start_time', '00:00:00')
                ->whereTime('end_time', '23:59:00')
                ->exists();
    }
}
