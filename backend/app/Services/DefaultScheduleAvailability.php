<?php

namespace App\Services;

use App\Models\Schedule;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class DefaultScheduleAvailability
{
    public function ensureThrough(CarbonImmutable $lastDate): void
    {
        DB::transaction(function () use ($lastDate): void {
            $state = DB::table('schedule_availability_state')
                ->where('id', 1)
                ->lockForUpdate()
                ->first();

            if (! $state) {
                throw new \RuntimeException('Default schedule availability state is missing.');
            }

            $firstDate = CarbonImmutable::parse($state->generated_until)->addDay();
            if ($firstDate->gt($lastDate)) {
                return;
            }

            $existingSchedules = Schedule::query()
                ->whereBetween('schedule_date', [$firstDate->toDateString(), $lastDate->toDateString()])
                ->get(['schedule_date', 'start_time', 'end_time']);
            $schedulesByDate = [];

            foreach ($existingSchedules as $schedule) {
                $date = $schedule->schedule_date->toDateString();
                $schedulesByDate[$date][] = [
                    'start' => $schedule->start_time->format('H:i'),
                    'end' => $schedule->end_time->format('H:i'),
                ];
            }

            $inserts = [];
            for ($date = $firstDate; $date->lte($lastDate); $date = $date->addDay()) {
                $dateValue = $date->toDateString();

                for ($hour = 9; $hour < 19; $hour++) {
                    $start = sprintf('%02d:00', $hour);
                    $end = sprintf('%02d:00', $hour + 1);
                    $overlapsExistingSchedule = collect($schedulesByDate[$dateValue] ?? [])
                        ->contains(fn (array $schedule): bool => $schedule['start'] < $end && $schedule['end'] > $start);

                    if ($overlapsExistingSchedule) {
                        continue;
                    }

                    $inserts[] = [
                        'schedule_date' => $dateValue,
                        'start_time' => $start,
                        'end_time' => $end,
                        'status' => 'available',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            foreach (array_chunk($inserts, 500) as $chunk) {
                DB::table('schedules')->insert($chunk);
            }

            DB::table('schedule_availability_state')
                ->where('id', 1)
                ->update([
                    'generated_until' => $lastDate->toDateString(),
                    'updated_at' => now(),
                ]);
        });
    }
}
