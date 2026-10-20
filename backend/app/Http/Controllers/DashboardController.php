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
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class DashboardController extends Controller
{
    public function overview(): JsonResponse
    {
        $upcomingBookings = Booking::query()
            ->with(['customer', 'package', 'schedule'])
            ->whereIn('booking_status', ['pending', 'approved', 'confirmed'])
            ->whereHas('schedule', fn ($query) => $query->whereDate('schedule_date', '>=', today()))
            ->orderBy('booked_at')
            ->limit(5)
            ->get();

        $weekSchedules = Schedule::query()
            ->whereBetween('schedule_date', [today(), today()->copy()->addDays(6)])
            ->where('status', '!=', 'blocked')
            ->get();

        $studioMinutes = $weekSchedules->sum(
            fn (Schedule $schedule): int => (int) $schedule->start_time->diffInMinutes($schedule->end_time),
        );

        return response()->json([
            'stats' => [
                'upcoming_bookings' => Booking::query()
                    ->whereIn('booking_status', ['pending', 'approved', 'confirmed'])
                    ->whereHas('schedule', fn ($query) => $query->whereDate('schedule_date', '>=', today()))
                    ->count(),
                'active_customers' => User::query()->where('role', 'Customer')->count(),
                'studio_hours' => round($studioMinutes / 60, 1),
            ],
            'bookings' => $upcomingBookings,
        ]);
    }

    public function bookings(): JsonResponse
    {
        return response()->json([
            'bookings' => Booking::query()
                ->with(['customer', 'package', 'schedule'])
                ->latest('booked_at')
                ->get(),
        ]);
    }

    public function schedules(Request $request, DefaultScheduleAvailability $availability): JsonResponse
    {
        $availability->ensureThrough(today()->addMonths(6)->toImmutable());
        $date = $request->date('date');

        return response()->json([
            'schedules' => Schedule::query()
                ->with(['bookings.customer', 'bookings.package'])
                ->when($date, fn ($query) => $query->whereDate('schedule_date', $date))
                ->orderBy('schedule_date')
                ->orderBy('start_time')
                ->get(),
        ]);
    }

    public function blockedScheduleDates(): JsonResponse
    {
        return response()->json([
            'blocked_dates' => DB::table('blocked_schedule_dates')
                ->orderBy('schedule_date')
                ->selectRaw('DATE(schedule_date) as blocked_date')
                ->pluck('blocked_date'),
        ]);
    }

    public function blockScheduleDate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'schedule_date' => ['required', 'date'],
        ]);

        DB::transaction(function () use ($validated): void {
            $daySchedules = Schedule::query()
                ->whereDate('schedule_date', $validated['schedule_date'])
                ->lockForUpdate()
                ->get();

            if ($daySchedules->contains(
                fn (Schedule $schedule): bool => $schedule->bookings()
                    ->whereIn('booking_status', ['pending', 'approved', 'confirmed'])
                    ->exists(),
            )) {
                throw ValidationException::withMessages([
                    'schedule_date' => ['A date with active bookings cannot be blocked.'],
                ]);
            }

            DB::table('blocked_schedule_dates')->insertOrIgnore([
                'schedule_date' => $validated['schedule_date'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Date blocked from public booking.',
            'schedule_date' => $validated['schedule_date'],
        ]);
    }

    public function unblockScheduleDate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'schedule_date' => ['required', 'date'],
        ]);

        DB::table('blocked_schedule_dates')
            ->where('schedule_date', $validated['schedule_date'])
            ->delete();

        return response()->json(['message' => 'Date unblocked.']);
    }

    public function customers(): JsonResponse
    {
        return response()->json([
            'customers' => User::query()
                ->where('role', 'Customer')
                ->withCount('bookings')
                ->withSum('bookings', 'total_price')
                ->latest()
                ->get(),
        ]);
    }

    public function packages(): JsonResponse
    {
        return response()->json([
            'packages' => Package::query()
                ->where('package_status', 'active')
                ->orderBy('package_name')
                ->get(['package_id', 'package_name', 'description', 'price', 'duration_minutes', 'inclusions', 'pricing_type']),
        ]);
    }

    public function storeCustomer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $customer = User::query()->create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            'role' => 'Customer',
        ]);

        return response()->json(['customer' => $customer], 201);
    }

    public function updateCustomer(Request $request, User $customer): JsonResponse
    {
        $this->ensureCustomer($customer);
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($customer->id)],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        if (filled($validated['password'] ?? null)) {
            $customer->password = Hash::make($validated['password']);
        }
        $customer->fill(collect($validated)->except('password')->all())->save();

        return response()->json(['customer' => $customer]);
    }

    public function destroyCustomer(User $customer): JsonResponse
    {
        $this->ensureCustomer($customer);
        DB::transaction(function () use ($customer): void {
            $customer = User::query()->lockForUpdate()->findOrFail($customer->id);
            $this->ensureCustomer($customer);
            if ($customer->bookings()->exists()) {
                throw ValidationException::withMessages([
                    'customer' => ['Customers with booking history cannot be deleted.'],
                ]);
            }

            $customer->delete();
        });

        return response()->json(['message' => 'Customer deleted.']);
    }

    public function storeSchedule(Request $request): JsonResponse
    {
        $validated = $this->validateSchedule($request);
        $this->ensureScheduleDoesNotOverlap($validated);
        $schedule = Schedule::query()->create($validated);

        return response()->json(['schedule' => $schedule->load('bookings.customer', 'bookings.package')], 201);
    }

    public function updateSchedule(Request $request, Schedule $schedule): JsonResponse
    {
        $validated = $this->validateSchedule($request);
        $this->ensureScheduleDoesNotOverlap($validated, $schedule->schedule_id);
        $schedule = DB::transaction(function () use ($validated, $schedule): Schedule {
            $schedule = Schedule::query()->lockForUpdate()->findOrFail($schedule->schedule_id);
            $hasActiveBookings = $schedule->bookings()
                ->whereIn('booking_status', ['pending', 'approved', 'confirmed'])
                ->exists();
            if ($validated['status'] === 'blocked' && $hasActiveBookings) {
                throw ValidationException::withMessages([
                    'status' => ['A schedule with an active booking cannot be blocked.'],
                ]);
            }

            $schedule->fill($validated);
            if ($hasActiveBookings) {
                $schedule->status = 'booked';
            }
            $schedule->save();

            return $schedule;
        });

        return response()->json(['schedule' => $schedule->load('bookings.customer', 'bookings.package')]);
    }

    public function destroySchedule(Schedule $schedule): JsonResponse
    {
        DB::transaction(function () use ($schedule): void {
            $schedule = Schedule::query()->lockForUpdate()->findOrFail($schedule->schedule_id);
            if ($schedule->bookings()->exists()) {
                throw ValidationException::withMessages([
                    'schedule' => ['Schedules with booking history cannot be deleted.'],
                ]);
            }

            $schedule->delete();
        });

        return response()->json(['message' => 'Schedule deleted.']);
    }

    public function storeBooking(Request $request): JsonResponse
    {
        $validated = $this->validateBooking($request);
        $booking = DB::transaction(function () use ($validated): Booking {
            $customer = User::query()->lockForUpdate()->findOrFail($validated['customer_id']);
            $this->ensureCustomer($customer);
            $schedule = Schedule::query()->lockForUpdate()->findOrFail($validated['schedule_id']);
            if ($schedule->status !== 'available') {
                throw ValidationException::withMessages([
                    'schedule_id' => ['That schedule is no longer available.'],
                ]);
            }
            if ($this->isScheduleDateBlocked($schedule)) {
                throw ValidationException::withMessages([
                    'schedule_id' => ['That date is blocked. Unblock it before creating a booking.'],
                ]);
            }

            $package = Package::query()->where('package_status', 'active')->findOrFail($validated['package_id']);
            if (! $package->fitsSchedule($schedule)) {
                throw ValidationException::withMessages([
                    'schedule_id' => ['This package requires a longer time slot.'],
                ]);
            }
            $booking = Booking::query()->create([
                ...$validated,
                'total_price' => $package->priceForSchedule($schedule),
                'booked_at' => now(),
            ]);
            if (in_array($booking->booking_status, ['pending', 'approved', 'confirmed'], true)) {
                $schedule->update(['status' => 'booked']);
            }

            return $booking;
        });

        return response()->json(['booking' => $booking->load(['customer', 'package', 'schedule'])], 201);
    }

    public function updateBooking(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'package_id' => ['required', 'integer', Rule::exists('packages', 'package_id')->where('package_status', 'active')],
            'schedule_id' => ['required', 'integer', 'exists:schedules,schedule_id'],
        ]);
        $booking = DB::transaction(function () use ($validated, $booking): Booking {
            $booking = Booking::query()->lockForUpdate()->findOrFail($booking->booking_id);
            $oldSchedule = Schedule::query()->lockForUpdate()->findOrFail($booking->schedule_id);
            $newSchedule = Schedule::query()->lockForUpdate()->findOrFail($validated['schedule_id']);

            if (
                in_array($booking->booking_status, ['pending', 'approved', 'confirmed'], true)
                && $this->isScheduleDateBlocked($newSchedule)
            ) {
                throw ValidationException::withMessages([
                    'schedule_id' => ['That date is blocked. Unblock it before changing this booking.'],
                ]);
            }
            if ($newSchedule->schedule_id !== $oldSchedule->schedule_id && $newSchedule->status !== 'available') {
                throw ValidationException::withMessages([
                    'schedule_id' => ['That schedule is no longer available.'],
                ]);
            }
            $package = Package::query()->where('package_status', 'active')->findOrFail($validated['package_id']);
            if (! $package->fitsSchedule($newSchedule)) {
                throw ValidationException::withMessages([
                    'schedule_id' => ['This package requires a longer time slot.'],
                ]);
            }

            $booking->fill([
                'package_id' => $package->package_id,
                'schedule_id' => $newSchedule->schedule_id,
                'total_price' => $package->priceForSchedule($newSchedule),
            ])->save();

            $oldScheduleHasActiveBookings = $oldSchedule->bookings()
                ->whereIn('booking_status', ['pending', 'approved', 'confirmed'])
                ->exists();
            if (! $oldScheduleHasActiveBookings && $oldSchedule->status === 'booked') {
                $oldSchedule->update(['status' => 'available']);
            }
            if (in_array($booking->booking_status, ['pending', 'approved', 'confirmed'], true)) {
                $newSchedule->update(['status' => 'booked']);
            }

            return $booking;
        });

        return response()->json(['booking' => $booking->load(['customer', 'package', 'schedule'])]);
    }

    public function decideBooking(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'decision' => ['required', Rule::in(['approve', 'deny', 'confirm', 'cancel'])],
            'reason' => ['required', 'string', 'max:2000'],
        ]);

        $booking = DB::transaction(function () use ($validated, $booking): Booking {
            $booking = Booking::query()->lockForUpdate()->findOrFail($booking->booking_id);
            $allowedStatuses = match ($validated['decision']) {
                'approve', 'deny' => ['pending'],
                'confirm' => ['approved'],
                'cancel' => ['approved', 'confirmed'],
            };
            if (! in_array($booking->booking_status, $allowedStatuses, true)) {
                throw ValidationException::withMessages([
                    'decision' => ['This action is not available for the current booking status.'],
                ]);
            }

            $schedule = Schedule::query()->lockForUpdate()->findOrFail($booking->schedule_id);
            $booking->booking_status = match ($validated['decision']) {
                'approve' => 'approved',
                'deny' => 'denied',
                'confirm' => 'confirmed',
                'cancel' => 'cancelled',
            };
            $booking->decision_reason = trim($validated['reason']);
            $booking->save();

            if (in_array($booking->booking_status, ['denied', 'cancelled'], true)) {
                $hasActiveBookings = $schedule->bookings()
                    ->whereIn('booking_status', ['pending', 'approved', 'confirmed'])
                    ->exists();
                if (! $hasActiveBookings && $schedule->status === 'booked') {
                    $schedule->update(['status' => 'available']);
                }
            }

            return $booking;
        });

        return response()->json([
            'message' => match ($validated['decision']) {
                'approve' => 'Booking approved.',
                'deny' => 'Booking denied.',
                'confirm' => 'Booking confirmed.',
                'cancel' => 'Booking cancelled.',
            },
            'booking' => $booking->load(['customer', 'package', 'schedule']),
        ]);
    }

    public function destroyBooking(Booking $booking): JsonResponse
    {
        DB::transaction(function () use ($booking): void {
            $schedule = Schedule::query()->lockForUpdate()->findOrFail($booking->schedule_id);
            $booking->delete();

            if ($schedule->status === 'booked' && ! $schedule->bookings()
                ->whereIn('booking_status', ['pending', 'approved', 'confirmed'])
                ->exists()) {
                $schedule->update(['status' => 'available']);
            }
        });

        return response()->json(['message' => 'Booking deleted.']);
    }

    private function ensureCustomer(User $customer): void
    {
        abort_unless($customer->role === 'Customer', 404);
    }

    private function isScheduleDateBlocked(Schedule $schedule): bool
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

    /**
     * @return array{schedule_date: string, start_time: string, end_time: string, status: string}
     */
    private function validateSchedule(Request $request): array
    {
        return $request->validate([
            'schedule_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'status' => ['required', Rule::in(['available', 'blocked'])],
        ]);
    }

    /**
     * @param  array{schedule_date: string, start_time: string, end_time: string, status: string}  $schedule
     */
    private function ensureScheduleDoesNotOverlap(array $schedule, ?int $ignoreId = null): void
    {
        $isDateBlocked = DB::table('blocked_schedule_dates')
            ->whereDate('schedule_date', $schedule['schedule_date'])
            ->exists()
            || Schedule::query()
                ->whereDate('schedule_date', $schedule['schedule_date'])
                ->where('status', 'blocked')
                ->whereTime('start_time', '00:00:00')
                ->whereTime('end_time', '23:59:00')
                ->when($ignoreId, fn ($query) => $query->where('schedule_id', '!=', $ignoreId))
                ->exists();

        if ($schedule['status'] !== 'blocked' && $isDateBlocked) {
            throw ValidationException::withMessages([
                'schedule_date' => ['This date is blocked. Unblock it before adding available time slots.'],
            ]);
        }

        $overlap = Schedule::query()
            ->whereDate('schedule_date', $schedule['schedule_date'])
            ->where('status', '!=', 'blocked')
            ->where('start_time', '<', $schedule['end_time'])
            ->where('end_time', '>', $schedule['start_time'])
            ->when($ignoreId, fn ($query) => $query->where('schedule_id', '!=', $ignoreId))
            ->exists();

        if ($overlap && $schedule['status'] !== 'blocked') {
            throw ValidationException::withMessages([
                'start_time' => ['This schedule overlaps another active schedule.'],
            ]);
        }
    }

    /**
     * @return array{customer_id: int, package_id: int, schedule_id: int, requests: string, booking_status: string}
     */
    private function validateBooking(Request $request): array
    {
        return $request->validate([
            'customer_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', 'Customer')],
            'package_id' => ['required', 'integer', Rule::exists('packages', 'package_id')->where('package_status', 'active')],
            'schedule_id' => ['required', 'integer', 'exists:schedules,schedule_id'],
            'requests' => ['required', 'string', 'max:10000'],
            'booking_status' => ['required', Rule::in(['pending'])],
        ]);
    }
}
