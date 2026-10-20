<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FaqItem extends Model
{
    protected $fillable = [
        'category',
        'summary',
        'detail',
        'sort_order',
    ];
}
