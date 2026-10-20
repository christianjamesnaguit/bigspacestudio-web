<?php

namespace App\Models;

use Database\Factories\PackageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'package_name',
    'description',
    'price',
    'duration_minutes',
    'inclusions',
    'package_status',
    'pricing_type',
])]
class Package extends Model
{
    /** @use HasFactory<PackageFactory> */
    use HasFactory;

    protected $primaryKey = 'package_id';

    protected $fillable = [
        'package_name',
        'description',
        'price',
        'duration_minutes',
        'inclusions',
        'package_status',
        'pricing_type',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration_minutes' => 'integer',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'package_id', 'package_id');
    }

    public function fitsSchedule(Schedule $schedule): bool
    {
        return $this->pricing_type === 'hourly'
            || $this->duration_minutes <= $this->scheduleDurationMinutes($schedule);
    }

    public function priceForSchedule(Schedule $schedule): float
    {
        $price = (float) $this->price;
        if ($this->pricing_type !== 'hourly') {
            return $price;
        }

        return round($price * $this->scheduleDurationMinutes($schedule) / 60, 2);
    }

    private function scheduleDurationMinutes(Schedule $schedule): int
    {
        return max(0, (int) $schedule->start_time->diffInMinutes($schedule->end_time));
    }
}
