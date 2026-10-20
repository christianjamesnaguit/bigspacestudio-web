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
        'file_path',
        'media_type',
    ];
}
