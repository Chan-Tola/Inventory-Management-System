<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::prefix('orders')->group(function () {
    Route::get('/', function () {
        return response()->json([
            'message' => 'API Orders success testing.',
            'data' => []
        ]);
    });
});
