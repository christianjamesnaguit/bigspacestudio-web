<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blocked_schedule_dates', function (Blueprint $table): void {
            $table->date('schedule_date')->primary();
            $table->timestamps();
        });

        if (Schema::hasTable('schedules')) {
            $legacyBlocks = DB::table('schedules')
                ->where('status', 'blocked')
                ->whereTime('start_time', '00:00:00')
                ->whereTime('end_time', '23:59:00')
                ->selectRaw('DATE(schedule_date) as blocked_date')
                ->pluck('blocked_date')
                ->unique()
                ->map(fn (string $date): array => [
                    'schedule_date' => $date,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
                ->all();

            if ($legacyBlocks !== []) {
                DB::table('blocked_schedule_dates')->insertOrIgnore($legacyBlocks);
                DB::table('schedules')
                    ->where('status', 'blocked')
                    ->whereTime('start_time', '00:00:00')
                    ->whereTime('end_time', '23:59:00')
                    ->whereNotExists(function ($query): void {
                        $query->selectRaw('1')
                            ->from('bookings')
                            ->whereColumn('bookings.schedule_id', 'schedules.schedule_id');
                    })
                    ->delete();
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('schedules')) {
            $blockedDates = DB::table('blocked_schedule_dates')
                ->selectRaw('DATE(schedule_date) as blocked_date')
                ->pluck('blocked_date');

            foreach ($blockedDates as $date) {
                $hasLegacyBlock = DB::table('schedules')
                    ->whereDate('schedule_date', $date)
                    ->where('status', 'blocked')
                    ->whereTime('start_time', '00:00:00')
                    ->whereTime('end_time', '23:59:00')
                    ->exists();

                if (! $hasLegacyBlock) {
                    DB::table('schedules')->insert([
                        'schedule_date' => $date,
                        'start_time' => '00:00:00',
                        'end_time' => '23:59:00',
                        'status' => 'blocked',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        Schema::dropIfExists('blocked_schedule_dates');
    }
};
