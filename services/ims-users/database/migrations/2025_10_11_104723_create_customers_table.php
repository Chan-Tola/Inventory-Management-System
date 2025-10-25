<?php

use App\Models\Customer;
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
        Schema::create(Customer::TABLENAME, function (Blueprint $table) {
            $table->id(Customer::ID);
            // note: foreign key constraint
            $table->unsignedBigInteger(Customer::USER_ID); // Step 1: create column
            $table->foreign(Customer::USER_ID)             // Step 2: add FK
                ->references(User::ID)
                ->on(User::TABLENAME)
                ->onDelete('cascade'); // note: If User is deleted, its Customer are deleted too
            $table->string(Customer::CUSTOMER_CODE)->unique();
            $table->enum(Customer::GENDER, ['male', 'female']);
            $table->text(Customer::ADDRESS);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(Customer::TABLENAME);
    }
};
