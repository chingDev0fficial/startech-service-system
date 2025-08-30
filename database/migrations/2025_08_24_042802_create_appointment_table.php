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
        Schema::create('appointment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')
                ->unique()
                ->constrained('client')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->date('schedule_at');
            $table->string('item');
            $table->string('service_type');
            $table->string('service_location');
            $table->string('description');
            $table->string('status')->default('pending');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment');
    }
};
