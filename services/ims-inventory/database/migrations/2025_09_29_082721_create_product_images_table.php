<?php

use App\Models\Product;
use App\Models\ProductImage;
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
        Schema::create(ProductImage::TABLE, function (Blueprint $table) {
            $table->id(ProductImage::ID);
            $table->unsignedBigInteger(ProductImage::PRODUCT_ID);
            $table->string(ProductImage::IMAGE_URL);
            $table->boolean(ProductImage::IS_PRIMARY)->default(false);
            $table->timestamps();

            // Foreign key constraint
            $table->foreign(ProductImage::PRODUCT_ID)
                ->references(Product::ID)
                ->on(Product::TABLENAME)
                ->onDelete('cascade'); //note: If product deleted, remove images
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(ProductImage::TABLE);
    }
};
