<?php

namespace Database\Factories;

use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Package>
 */
class PackageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'package_name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 500, 10000),
            'duration_minutes' => fake()->randomElement([30, 60, 90, 120, 240]),
            'inclusions' => fake()->sentences(2, true),
            'package_status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
