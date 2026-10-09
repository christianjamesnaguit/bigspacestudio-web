<?php

namespace Database\Factories;

use App\Models\Schedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Schedule>
 */
class ScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startTime = fake()->dateTimeBetween('09:00:00', '17:00:00');

        return [
            'schedule_date' => fake()->dateTimeBetween('now', '+30 days')->format('Y-m-d'),
            'start_time' => $startTime->format('H:i:s'),
            'end_time' => (clone $startTime)->modify('+1 hour')->format('H:i:s'),
            'status' => 'available',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
