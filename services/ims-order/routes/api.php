<?php

use App\Http\Controllers\Api\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// ✅ Order CRUD Routes
Route::prefix('orders')->group(function () {
    // GET /api/orders - List all orders
    Route::get('/', [OrderController::class, 'index']);

    // POST /api/orders - Create new order
    Route::post('/', [OrderController::class, 'store']);

    // GET /api/orders/{id} - Get single order
    Route::get('/{id}', [OrderController::class, 'show']);

    // PUT /api/orders/{id}/status - Update order status
    Route::put('/{id}/status', [OrderController::class, 'updateStatus']);

    // DELETE /api/orders/{id} - Delete order
    Route::delete('/{id}', [OrderController::class, 'destroy']);

    // GET /api/orders/reports/sales - Sales report
    Route::get('/reports/sales', [OrderController::class, 'salesReport']);
});

// ✅ Health check route (optional)
Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'service' => 'IMS Order Service',
        'timestamp' => now()
    ]);
});
