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
}
