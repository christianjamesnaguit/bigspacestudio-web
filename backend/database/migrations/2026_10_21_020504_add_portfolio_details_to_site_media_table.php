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
            $table->string('category', 80)->nullable();
            $table->string('shoot_type', 120)->nullable();
            $table->string('client_name', 180)->nullable();
        });

        $portfolioDetails = [
            'portfolio.1' => ['Graduation', 'Graduation portrait'],
            'portfolio.2' => ['Solo Creative', 'Creative studio portrait'],
            'portfolio.3' => ['Graduation', 'Graduation portrait'],
            'portfolio.4' => ['Solo Creative', 'Studio portrait'],
            'portfolio.5' => ['Graduation', 'Graduation portrait'],
            'portfolio.6' => ['Solo Creative', 'Studio portrait'],
        ];

        foreach ($portfolioDetails as $mediaKey => [$category, $shootType]) {
            DB::table('site_media')
                ->where('media_key', $mediaKey)
                ->update([
                    'category' => $category,
                    'shoot_type' => $shootType,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_media', function (Blueprint $table): void {
            $table->dropColumn(['category', 'shoot_type', 'client_name']);
        });
    }
};
