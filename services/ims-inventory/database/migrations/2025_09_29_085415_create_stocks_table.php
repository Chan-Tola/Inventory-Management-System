<?php

use App\Models\Product;
use App\Models\Stock;
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
        Schema::create(Stock::TABLENAME, function (Blueprint $table) {
            $table->id(Stock::ID);
            $table->unsignedBigInteger(Stock::PRODUCT_ID);
            $table->integer(Stock::QUANTITY);
            $table->integer(Stock::MIN_QUANTITY);
            $table->timestamps();

            // note: fk prodcut_id from Table product
            $table->foreign(Stock::PRODUCT_ID)
                ->references(Product::ID)
                ->on(Product::TABLENAME)
                ->onDelete('cascade'); //note: If product deleted, remove stock
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(Stock::TABLENAME);
    }
};
