<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function overview(): JsonResponse
    {
        $upcomingBookings = Booking::query()
            ->with(['customer', 'package', 'schedule'])
            ->where('booking_status', '!=', 'cancelled')
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
                    ->where('booking_status', '!=', 'cancelled')
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

    public function schedules(Request $request): JsonResponse
    {
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
}
