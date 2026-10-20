<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->enum('booking_status', ['pending', 'approved', 'confirmed', 'denied', 'cancelled'])
                ->default('pending')
                ->change();
        });

        DB::table('bookings')
            ->where('booking_status', 'cancelled')
            ->whereNotNull('decision_reason')
            ->update(['booking_status' => 'denied']);
    }

    public function down(): void
    {
        DB::table('bookings')->where('booking_status', 'denied')->update(['booking_status' => 'cancelled']);
        DB::table('bookings')->where('booking_status', 'approved')->update(['booking_status' => 'confirmed']);

        Schema::table('bookings', function (Blueprint $table): void {
            $table->enum('booking_status', ['pending', 'confirmed', 'cancelled'])
                ->default('pending')
                ->change();
        });
    }
};
