<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SupplierController extends Controller
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
            $cacheKey = $this->cacheService->generateKey('suppliers', $request->query());

            // Use cache with 30 minutes TTL
            $suppliers = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () {
                    return Supplier::all();
                },
                'suppliers' // Tag for easy clearing
            );

            return response()->json([
                'message' => 'Suppliers retrieved successfully',
                'data' => SupplierResource::collection($suppliers)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve suppliers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $supplier = Supplier::create($request->validated());

            // 🔥 Clear cache after creating supplier
            $this->clearSupplierCache();

            DB::commit();
            return response()->json([
                'message' => 'Supplier created successfully.',
                'data' => new SupplierResource($supplier)
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            // Generate cache key for specific supplier
            $cacheKey = $this->cacheService->generateKey("supplier:{$id}");

            $supplier = $this->cacheService->remember(
                $cacheKey,
                1800,
                function () use ($id) {
                    return Supplier::find($id);
                },
                'suppliers'
            );

            if (!$supplier) {
                return response()->json(['message' => 'Supplier not found'], 404);
            }

            return response()->json([
                'message' => 'Supplier retrieved successfully',
                'data' => new SupplierResource($supplier) // Use SupplierResource here
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve supplier.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(UpdateSupplierRequest $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $supplier = Supplier::find($id);

            if (!$supplier) {
                return response()->json(['message' => 'Supplier not found'], 404);
            }

            // The request is already validated at this point from (UpdateSupplierRequest method)
            $supplier->update($request->validated());

            // 🔥 Clear cache after updating supplier
            $this->clearSupplierCache($id);

            DB::commit();
            return response()->json([
                'message' => 'Supplier updated successfully',
                'data' => new SupplierResource($supplier)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update supplier.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $supplier = Supplier::find($id);
            if (!$supplier) {
                return response()->json(['message' => 'Supplier not found'], 404);
            }

            $supplier->delete();

            // 🔥 Clear cache after deleting supplier
            $this->clearSupplierCache($id);

            DB::commit();
            return response()->json([
                'message' => 'Supplier deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete supplier.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear supplier cache
     */
    private function clearSupplierCache(?int $supplierId = null): void
    {
        try {
            // Clear specific supplier if ID provided
            if ($supplierId) {
                $this->cacheService->forget("supplier:{$supplierId}");
            }

            // Clear all supplier list caches
            $this->cacheService->clearByPrefix('suppliers:');

            // Clear by tag
            $this->cacheService->clearByTag('suppliers');
        } catch (\Exception $e) {
            // Don't fail the operation if cache clearing fails
            Log::warning('Failed to clear supplier cache', [
                'supplier_id' => $supplierId,
                'error' => $e->getMessage()
            ]);
        }
    }
}
