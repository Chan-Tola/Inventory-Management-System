<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockRequest;
use App\Http\Requests\UpdateStockRequest;
use App\Http\Resources\StockResource;
use App\Models\Stock;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockController extends Controller
{
    private $cacheService;

    // Inject CacheService in constructor
    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            // Generate cache key
            $cacheKey = $this->cacheService->generateKey('stocks', $request->query());

            // Use cache with 30 minutes TTL
            $stocks = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () {
                    return Stock::with('product')->get();
                },
                'stocks' // Tag for easy clearing
            );

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

            // 🔥 Clear cache after creating stock
            $this->clearStockCache();

            DB::commit();

            return response()->json([
                'message' => 'Stock created successfully.',
                'data' => new StockResource($stock)
            ]);
        } catch (\Exception $e) {
            // catch any unexpected errors
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            // Generate cache key for specific stock
            $cacheKey = $this->cacheService->generateKey("stock:{$id}");

            $stock = $this->cacheService->remember(
                $cacheKey,
                1800,
                function () use ($id) {
                    return Stock::find($id);
                },
                'stocks'
            );

            if (!$stock) {
                return response()->json(['message' => 'Stock not found'], 404);
            }

            return response()->json([
                'message' => 'Stock retrieved successfully',
                'data' => new StockResource($stock) // Use StockResource here
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved stock.',
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

            // The request is already validated at this point from (UpdateStockRequest method)
            $stock->update($request->validated());

            // 🔥 Clear cache after updating stock
            $this->clearStockCache($id);

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

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $stock = Stock::find($id);
            if (!$stock) {
                return response()->json(['message' => 'Stock not found'], 404);
            }

            $stock->delete();

            // 🔥 Clear cache after deleting stock
            $this->clearStockCache($id);

            DB::commit();

            return response()->json([
                'message' => 'Stock deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete stock.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear stock cache
     */
    private function clearStockCache(?int $stockId = null): void
    {
        try {
            // Clear specific stock if ID provided
            if ($stockId) {
                $this->cacheService->forget("stock:{$stockId}");
            }

            // Clear all stock list caches
            $this->cacheService->clearByPrefix('stocks:');

            // Clear by tag
            $this->cacheService->clearByTag('stocks');

            // Also clear product caches since stock changes affect product availability
            $this->cacheService->clearByTag('products');
            $this->cacheService->clearByPrefix('products:');
        } catch (\Exception $e) {
            // Don't fail the operation if cache clearing fails
            Log::warning('Failed to clear stock cache', [
                'stock_id' => $stockId,
                'error' => $e->getMessage()
            ]);
        }
    }
}
