<?php

use App\Models\Category;
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
        Schema::create(Product::TABLENAME, function (Blueprint $table) {
            $table->id(Product::ID); // note: auto-increment ID
            $table->string(Product::NAME); // note: Prodcut Name
            $table->string(Product::SKU)->unique(); //note: SKU 
            $table->unsignedBigInteger(Product::CATEGORY_ID);
            $table->string(Product::BRAND); // note: Brand name
            $table->decimal(Product::PRICE, 10, 2); // note:Selling price
            $table->text(Product::DESCRIPTION)->nullable(); // note: Optional description
            $table->timestamps();
            // note: foreign key constraint
            $table->foreign(Product::CATEGORY_ID)
                ->references(Category::ID)
                ->on(Category::TABLENAME)
                ->onDelete('cascade'); // note: If category is deleted, its products are deleted too
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(Product::TABLENAME);
    }
};
