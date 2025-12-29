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
        Schema::table('appointment', function(Blueprint $table) {
            $table->decimal('fix_price', 20, 2)->after('warranty_receipt')->default(0.0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointment', function(Blueprint $table) {
            $table->dropColumn('fix_price');
        });
    }
};
