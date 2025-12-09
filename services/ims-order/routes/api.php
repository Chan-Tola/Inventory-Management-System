<?php

use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TopSellController;
use Illuminate\Support\Facades\Route;

Route::prefix('orders')->group(function () {
    // List all orders
    Route::get('/', [OrderController::class, 'index']);
    // Create new order
    Route::post('/', [OrderController::class, 'store']);
    // Get single order
    Route::get('/{id}', [OrderController::class, 'show']);
    // Update order status
    Route::put('/{id}/status', [OrderController::class, 'updateStatus']);
    // Delete order
    Route::delete('/{id}', [OrderController::class, 'destroy']);
});

Route::get('/sale-reports', [ReportController::class, 'getReport']);
Route::get('/top-selling', [TopSellController::class, 'getTopSellingProducts']);
