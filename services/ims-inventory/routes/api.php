<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::prefix('inventory')->group(function () {
    Route::get('/products', function () {
        return response()->json([
            'message' => 'API inventory/products success testing.',
            'data' => []
        ]);
    });
});
