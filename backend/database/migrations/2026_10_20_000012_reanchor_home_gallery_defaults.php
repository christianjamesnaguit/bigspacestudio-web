<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        foreach (range(1, 3) as $index) {
            DB::table('site_media')
                ->where('media_key', "home.carousel.{$index}")
                ->update(['default_url' => "/images/photo{$index}.jpg"]);
        }

        foreach (range(1, 6) as $index) {
            DB::table('site_media')
                ->where('media_key', "home.showcase.{$index}")
                ->update(['default_url' => "/images/eg{$index}.jpg"]);
        }
    }

    public function down(): void
    {
        foreach (range(1, 3) as $index) {
            DB::table('site_media')
                ->where('media_key', "home.carousel.{$index}")
                ->update(['default_url' => "/images/carousel/photo{$index}.jpg"]);
        }

        foreach (range(1, 6) as $index) {
            DB::table('site_media')
                ->where('media_key', "home.showcase.{$index}")
                ->update(['default_url' => "/images/showcase/eg{$index}.jpg"]);
        }
    }
};
