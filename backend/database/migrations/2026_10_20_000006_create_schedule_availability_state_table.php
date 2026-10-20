<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_availability_state', function (Blueprint $table): void {
            $table->unsignedTinyInteger('id')->primary();
            $table->date('generated_until');
            $table->timestamps();
        });

        DB::table('schedule_availability_state')->insert([
            'id' => 1,
            'generated_until' => today()->subDay()->toDateString(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_availability_state');
    }
};
