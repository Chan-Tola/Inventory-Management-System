<?php

use App\Models\Order;
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
        Schema::table(Order::TABLENAME, function (Blueprint $table) {
            // Add index for faster date-based queries with status filter
            $table->index(['order_date', 'status'], 'orders_date_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table(Order::TABLENAME, function (Blueprint $table) {
            $table->dropIndex('orders_date_status_idx');
        });
    }
};
