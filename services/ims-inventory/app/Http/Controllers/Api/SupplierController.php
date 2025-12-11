<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Services\CacheService;  // ADD THIS LINE
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;    // ADD THIS LINE
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
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
            $cacheKey = $this->cacheService->generateKey('suppliers', $request->query());

            $suppliers = $this->cacheService->remember(
                $cacheKey,
                3600, // 1 hour (suppliers don't change often)
                function () {
                    return Supplier::all();
                },
                'suppliers'
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

            // ADD CACHE CLEARING
            $this->cacheService->clearByTag('suppliers');
            $this->cacheService->clearByTag("supplier:{$supplier->id}");

            DB::commit();
            return response()->json([
                'message' => 'Supplier created successfully.',
                'data' => new SupplierResource($supplier)
            ]);
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
            // ADD CACHING
            $cacheKey = $this->cacheService->generateKey("supplier:{$id}");

            $supplier = $this->cacheService->remember(
                $cacheKey,
                3600, // 1 hour
                function () use ($id) {
                    return Supplier::find($id);
                },
                "supplier:{$id}"
            );

            if (!$supplier) {
                return response()->json(['message' => 'Supplier not found'], 404);
            }

            return response()->json([
                'message' => 'Supplier retrieved successfully',
                'data' => new SupplierResource($supplier)  // Use Resource
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

            $supplier->update($request->validated());

            // ADD CACHE CLEARING
            $this->cacheService->clearByTag('suppliers');
            $this->cacheService->clearByTag("supplier:{$id}");

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

            // ADD CACHE CLEARING
            $this->cacheService->clearByTag('suppliers');
            $this->cacheService->clearByTag("supplier:{$id}");

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
}
