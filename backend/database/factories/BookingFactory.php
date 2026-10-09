<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Package;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => User::factory(),
            'package_id' => Package::factory(),
            'schedule_id' => Schedule::factory(),
            'requests' => fake()->paragraph(),
            'total_price' => fake()->randomFloat(2, 500, 10000),
            'booking_status' => 'pending',
            'booked_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
