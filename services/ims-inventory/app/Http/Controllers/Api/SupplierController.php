<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $suppliers = Supplier::all();
            return response()->json([
                'message' => 'suppliers retrieved successfully',
                'data' => SupplierResource::collection($suppliers)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved supsuppliers',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function store(StoreSupplierRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $supplier = Supplier::create($request->validated());

            DB::commit();
            return response()->json([
                'message' => 'supsuppliers created successfully.',
                'data' => new SupplierResource($supplier)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create supsuppliers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function show($id): JsonResponse
    {
        try {
            $supplier = Supplier::find($id);
            if (!$supplier) {
                return response()->json(['message' => 'supplier not found'], 404);
            }
            return response()->json([
                'message' => 'supsupplier retrieved successfully',
                'data' => $supplier
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved supsupplier.',
                'error' =>  $e->getMessage()
            ], 500);
        }
    }

    public function update(UpdateSupplierRequest $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $supplier = Supplier::find($id);

            if (!$supplier) {
                return response()->json(['message' => 'supplier not found'], 404);
            }

            //  the request is already validated at this point from (UpdatesupplierRequest method)
            $supplier->update($request->validated());

            DB::commit();
            return response()->json([
                'message' => 'supplier update successfully',
                'data' => new SupplierResource($supplier)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to updated supplier.',
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
                return response()->json(['message' => 'supplier not found'], 404);
            }
            $supplier->delete();
            DB::commit();
            return response()->json([
                'message' => 'supplier deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to deleted supplier.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
