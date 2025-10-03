<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $products = Product::all();
            return response()->json([
                'message' => 'Categories retrieved successfully',
                'data' => ProductResource::collection($products)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        try {
            // note:The request is already validated at this point
            $product = Product::create($request->validated());
            //note: check found or not
            return response()->json([
                'message' => 'Product created successfully.',
                'data' => new ProductResource($product)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to updated Products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return response()->json(['message' => 'Product Not Found'], 404);
            }

            return response()->json([
                'message' => 'Products retrieved successfully',
                'data' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved Products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreProductRequest $request, $id): JsonResponse
    {
        try {
            $product = Product::find($id);
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }
            // note: the request is already validated at this point from (UpdateCategoryRequest method)
            $product->update($request->validated());

            return response()->json([
                'message' => 'Product updated successfully.',
                'date' => new ProductResource($product)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to updated product.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $product = Product::find($id);
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            $product->delete();

            return response()->json([
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to deleted product.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
