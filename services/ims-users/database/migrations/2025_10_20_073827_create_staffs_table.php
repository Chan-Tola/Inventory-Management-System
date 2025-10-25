<?php

use App\Models\Staff;
use App\Models\User;
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
        Schema::create(Staff::TABLENAME, function (Blueprint $table) {
            $table->id(Staff::ID);
            // note: foreign key constraint
            $table->unsignedBigInteger(Staff::USER_ID); // Step 1: create column
            $table->foreign(Staff::USER_ID)             // Step 2: add FK
                ->references(User::ID)
                ->on(User::TABLENAME)
                ->onDelete('cascade'); // note: If User is deleted, its Staff are deleted too
            $table->string(Staff::STAFF_CODE)->unique();
            $table->enum(Staff::GENDER, ['male', 'female']);
            $table->text(Staff::ADDRESS);
            $table->decimal(Staff::SALARY, 10, 2);
            $table->date(Staff::HIRE_DATE);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(Staff::TABLENAME);
    }
};
