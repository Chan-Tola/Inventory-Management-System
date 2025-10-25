<?php

use App\Models\Product;
use App\Models\Staff;
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
        Schema::table(Product::TABLENAME, function (Blueprint $table) {
            $table->foreignId('staff_id')   // creates staff_id column
                ->nullable()              // allows it to be empty
                ->constrained('staffs')  // references staffs.id
                ->onDelete('set null');  // if staff deleted, set to null
        });
        // foreignId('staff_id') Creates staff_id column
        // nullable() Allows it to be empty
        // constrained('staff') Links staff_id → staff.id (foreign key) ('staffs' is table name)
        // onDelete('set null') Staff deleted → column becomes NULL
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table(Product::TABLENAME, function (Blueprint $table) {
            //
        });
    }
};
