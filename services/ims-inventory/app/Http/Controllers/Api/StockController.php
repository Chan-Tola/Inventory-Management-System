<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockRequest;
use App\Http\Requests\UpdateStockRequest;
use App\Http\Resources\StockResource;
use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class StockController extends Controller
{

    public function index(): JsonResponse
    {
        try {
            $stocks = Stock::all();
            return response()->json([
                'message' => 'Stocks retrieved successfully',
                'data' => StockResource::collection($stocks)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved stocks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(StoreStockRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();
            // The request is already validated at this point
            $stock = Stock::create($request->validated());
            DB::commit();
            return response()->json([
                'message' => 'Stock created successfully.',
                'data' => new StockResource($stock)
            ]);
        } catch (\Exception $e) {
            // catch any unexpected errors
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $stock = Stock::find($id);
            if (!$stock) {
                return response()->json(['message' => 'Stock not found'], 404);
            }
            return response()->json([
                'message' => 'Stock retrieved successfully',
                'data' => $stock
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved stock.',
                'error' =>  $e->getMessage()
            ], 500);
        }
    }

    public function update(UpdateStockRequest $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $stock = Stock::find($id);
            if (!$stock) {
                return response()->json(['message' => 'Stock not found'], 404);
            }

            // the request is already validated at this point from (UpdateStockRequest method)
            $stock->update($request->validated());
            DB::commit();
            return response()->json([
                'message' => 'Update new stocks successfully',
                'data' => new StockResource($stock)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to updated stocks.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy() {}
}
