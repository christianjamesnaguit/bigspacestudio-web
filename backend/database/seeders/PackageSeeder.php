<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'package_name' => 'Portrait Session',
                'description' => 'Individual or couple portraits.',
                'price' => 3500,
                'duration_minutes' => 60,
                'inclusions' => 'Individual or couple portraits',
                'pricing_type' => 'fixed',
            ],
            [
                'package_name' => 'Creative Shoot',
                'description' => 'Bring your concept to life.',
                'price' => 5000,
                'duration_minutes' => 60,
                'inclusions' => 'Creative studio session',
                'pricing_type' => 'fixed',
            ],
            [
                'package_name' => 'Studio Rental',
                'description' => 'A private space for your production.',
                'price' => 1500,
                'duration_minutes' => 60,
                'inclusions' => 'Private studio use, billed per hour',
                'pricing_type' => 'hourly',
            ],
        ];

        foreach ($packages as $package) {
            Package::query()->firstOrCreate(
                ['package_name' => $package['package_name']],
                [...$package, 'package_status' => 'active'],
            );
        }
    }
}
