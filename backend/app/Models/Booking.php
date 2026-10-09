<?php

namespace App\Models;

use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'customer_id',
    'package_id',
    'schedule_id',
    'requests',
    'total_price',
    'booking_status',
    'booked_at',
])]
class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory;

    protected $primaryKey = 'booking_id';

    protected $fillable = [
        'customer_id',
        'package_id',
        'schedule_id',
        'requests',
        'total_price',
        'booking_status',
        'booked_at',
    ];

    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
            'booked_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'package_id', 'package_id');
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class, 'schedule_id', 'schedule_id');
    }
}
