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
        Schema::table('appointment', function (Blueprint $table) {
            // 1. Drop the foreign key first
            $table->dropForeign(['client_id']);

            // 2. Drop the unique constraint
            $table->dropUnique(['client_id']);

            // 3. Recreate the foreign key without unique
            $table->foreign('client_id')
                ->references('id')
                ->on('client')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointment', function (Blueprint $table) {
            // 1. Drop the foreign key
            $table->dropForeign(['client_id']);

            // 2. Restore the unique constraint
            $table->unique('client_id');

            // 3. Recreate the foreign key with unique
            $table->foreign('client_id')
                ->references('id')
                ->on('client')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }
};
