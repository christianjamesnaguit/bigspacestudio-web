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
        Schema::create('packages', function (Blueprint $table) {
            $table->increments('package_id');
            $table->string('package_name', 150);
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->integer('duration_minutes');
            $table->text('inclusions');
            $table->enum('package_status', ['active', 'inactive'])->default('active');
            $table->dateTime('created_at');
            $table->dateTime('updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
