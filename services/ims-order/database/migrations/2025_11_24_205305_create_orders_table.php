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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('staff_id')->constrained('staffs')->onDelete('cascade');
            $table->decimal('total_amount', 12, 2);
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('completed');
            $table->datetime('order_date')->default(now());
            $table->timestamps();

            // Indexes
            $table->index(['customer_id', 'order_date']);
            $table->index('staff_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
