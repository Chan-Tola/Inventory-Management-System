<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;


Route::prefix('inventory')->group(function () {
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('stocks', StockController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::prefix('transactions')->group(function () {
        Route::get('/', [TransactionController::class, 'index']);
        Route::post('/', [TransactionController::class, 'store']);
        Route::get('/{id}', [TransactionController::class, 'show']);
    });
});


// ✅ INTERNAL ROUTES - No authentication required
Route::prefix('internal')->group(function () {
    // Internal transaction creation for service-to-service calls
    Route::post('/transactions', [TransactionController::class, 'storeInternal']);
});
