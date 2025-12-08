<?php

use App\Models\Product;
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
            $table->decimal(Product::SALE_PRICE, 10, 2)
                ->nullable()
                ->after(Product::PRICE);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table(Product::TABLENAME, function (Blueprint $table) {});
    }
};
