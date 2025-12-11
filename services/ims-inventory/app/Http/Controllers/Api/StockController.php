<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockRequest;
use App\Http\Requests\UpdateStockRequest;
use App\Http\Resources\StockResource;
use App\Models\Stock;
use App\Services\CacheService;  // ADD THIS LINE
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;    // ADD THIS LINE
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockController extends Controller
{
    private $cacheService;

    // ADD CONSTRUCTOR
    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    public function index(Request $request): JsonResponse  // ADD Request parameter
    {
        try {
            // ADD CACHING
            $cacheKey = $this->cacheService->generateKey('stocks', $request->query());

            $stocks = $this->cacheService->remember(
                $cacheKey,
                300, // 5 minutes
                function () {
                    return Stock::with('product')->get();
                },
                'stocks'
            );

            return response()->json([
                'message' => 'Stocks retrieved successfully',
                'data' => StockResource::collection($stocks)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve stocks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(StoreStockRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $stock = Stock::create($request->validated());

            // ADD CACHE CLEARING
            $this->cacheService->clearByTag('stocks');
            $this->cacheService->clearByTag("stock:{$stock->id}");

            DB::commit();
            return response()->json([
                'message' => 'Stock created successfully.',
                'data' => new StockResource($stock)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create stock',  // Fixed typo: category to stock
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            // ADD CACHING
            $cacheKey = $this->cacheService->generateKey("stock:{$id}");

            $stock = $this->cacheService->remember(
                $cacheKey,
                300, // 5 minutes
                function () use ($id) {
                    return Stock::find($id);
                },
                "stock:{$id}"
            );

            if (!$stock) {
                return response()->json(['message' => 'Stock not found'], 404);
            }

            return response()->json([
                'message' => 'Stock retrieved successfully',
                'data' => new StockResource($stock)  // Use Resource
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve stock.',
                'error' => $e->getMessage()
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

            $stock->update($request->validated());

            // ADD CACHE CLEARING
            $this->cacheService->clearByTag('stocks');
            $this->cacheService->clearByTag("stock:{$id}");

            DB::commit();
            return response()->json([
                'message' => 'Stock updated successfully',
                'data' => new StockResource($stock)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update stock.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy() {}
}
