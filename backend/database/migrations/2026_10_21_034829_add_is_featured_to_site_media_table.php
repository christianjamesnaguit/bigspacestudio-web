<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('site_media', function (Blueprint $table): void {
            $table->boolean('is_featured')->default(false);
        });

        DB::table('site_media')
            ->where('media_key', 'portfolio.1')
            ->update(['is_featured' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_media', function (Blueprint $table): void {
            $table->dropColumn('is_featured');
        });
    }
};
