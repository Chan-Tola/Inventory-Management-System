<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::prefix('inventory')->group(function () {
    // note: Categories CRUD - using apiResource
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
});
