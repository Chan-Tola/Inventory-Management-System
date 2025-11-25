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
        Schema::create(Transaction::TABLENAME, function (Blueprint $table) {
            $table->id();
            $table->enum(Transaction::TRANSACTION_TYPE, ['in', 'out']);
            $table->foreignId(Transaction::PRODUCT_ID)->constrained()->onDelete('cascade'); // ✅ FK
            $table->integer(Transaction::QUANTITY);
            $table->datetime(Transaction::TRANSACTION_DATE)->default(now());

            // ✅ NOW USE FOREIGN KEYS (same database)
            $table->foreignId(Transaction::STAFF_ID)->constrained('staffs')->onDelete('cascade');
            $table->foreignId(Transaction::SUPPLIER_ID)->nullable()->constrained()->onDelete('set null');

            $table->text(Transaction::NOTES)->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['product_id', 'transaction_date']);
            $table->index('transaction_type');
            $table->index('staff_id');
            $table->index('supplier_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(Transaction::TABLENAME);
    }
};
