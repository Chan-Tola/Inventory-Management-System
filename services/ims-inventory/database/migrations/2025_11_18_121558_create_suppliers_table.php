<?php

use App\Models\Supplier;
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
        Schema::create(Supplier::TABLENAME, function (Blueprint $table) {
            $table->id(Supplier::ID);
            $table->string(Supplier::NAME);
            $table->string(Supplier::CONTACT, 100);
            $table->text(Supplier::ADDRESS)->nullable(); // note: Optional description
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(Supplier::TABLENAME);
    }
};
