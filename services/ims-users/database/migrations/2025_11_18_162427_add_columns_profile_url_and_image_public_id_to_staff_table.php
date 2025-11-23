<?php

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
        Schema::table(Staff::TABLENAME, function (Blueprint $table) {
            $table->string(Staff::PROFILE_URL)->nullable()->after(Staff::STAFF_CODE);
            $table->string(Staff::IMAGE_PUBLIC_ID)->nullable()->after(Staff::PROFILE_URL);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table(Staff::TABLENAME, function (Blueprint $table) {
            //
        });
    }
};
