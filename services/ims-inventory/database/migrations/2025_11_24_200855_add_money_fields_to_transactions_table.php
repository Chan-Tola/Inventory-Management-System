<?php

use App\Models\Transaction;
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
        Schema::table(Transaction::TABLENAME, function (Blueprint $table) {
            $table->decimal(Transaction::AMOUNT, 12, 2)->nullable()->after(Transaction::QUANTITY);
            $table->enum(Transaction::MONEY_TYPE, [Transaction::MONEY_INCOME, Transaction::MONEY_EXPENSE])->nullable()->after(Transaction::AMOUNT);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table(Transaction::TABLENAME, function (Blueprint $table) {
            //
        });
    }
};
