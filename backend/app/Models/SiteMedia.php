<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteMedia extends Model
{
    protected $fillable = [
        'media_key',
        'label',
        'default_url',
        'alt_text',
        'category',
        'shoot_type',
        'client_name',
        'is_featured',
        'file_path',
        'media_type',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
    ];
}
