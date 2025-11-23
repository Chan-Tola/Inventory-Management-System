<?php

use App\Models\Category;
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
        Schema::table(Category::TABLENAME, function (Blueprint $table) {
            $table->foreignId('staff_id')   // creates staff_id column
                ->nullable()              // allows it to be empty
                ->constrained('staffs')  // references staffs.id
                ->onDelete('set null');  // if staff deleted, set to null
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table(Category::TABLENAME, function (Blueprint $table) {
            //
        });
    }
};
