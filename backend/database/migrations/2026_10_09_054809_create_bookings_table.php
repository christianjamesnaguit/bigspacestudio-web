<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('bookings')) {
            Schema::table('bookings', function (Blueprint $table): void {
                $table->unsignedBigInteger('customer_id')->change();
                $table->foreign('customer_id')->references('id')->on('users');
                $table->foreign('package_id')->references('package_id')->on('packages');
                $table->foreign('schedule_id')->references('schedule_id')->on('schedules');
            });

            return;
        }

        Schema::create('bookings', function (Blueprint $table) {
            $table->increments('booking_id');
            $table->foreignId('customer_id');
            $table->unsignedInteger('package_id');
            $table->unsignedInteger('schedule_id');
            $table->text('requests');
            $table->decimal('total_price', 10, 2);
            $table->enum('booking_status', ['pending', 'confirmed', 'cancelled'])->default('pending');
            $table->dateTime('booked_at');
            $table->dateTime('created_at');
            $table->dateTime('updated_at');

            $table->foreign('customer_id')->references('id')->on('users');
            $table->foreign('package_id')->references('package_id')->on('packages');
            $table->foreign('schedule_id')->references('schedule_id')->on('schedules');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
