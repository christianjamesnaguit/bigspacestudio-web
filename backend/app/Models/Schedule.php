<?php

namespace App\Models;

use Database\Factories\ScheduleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'schedule_date',
    'start_time',
    'end_time',
    'status',
])]
class Schedule extends Model
{
    /** @use HasFactory<ScheduleFactory> */
    use HasFactory;

    protected $primaryKey = 'schedule_id';

    protected $fillable = [
        'schedule_date',
        'start_time',
        'end_time',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'schedule_date' => 'date:Y-m-d',
            'start_time' => 'datetime:H:i:s',
            'end_time' => 'datetime:H:i:s',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'schedule_id', 'schedule_id');
    }
}
