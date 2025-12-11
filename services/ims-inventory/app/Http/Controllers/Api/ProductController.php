<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\ProductImage;
use App\Services\CacheService;  // ADD THIS IMPORT
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    private $cacheService;

    // ADD CONSTRUCTOR FOR CACHE SERVICE
    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse  // ADD Request parameter
    {
        try {
            // Generate cache key with query params
            $cacheKey = $this->cacheService->generateKey('products', $request->query());

            $products = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () {
                    return Product::select('id', 'name', 'sku', 'brand', 'price', 'sale_price', 'category_id', 'description', 'staff_id')
                        ->with([
                            'category:id,name',
                            'images'
                        ])
                        ->get();
                },
                'products'  // Tag for easy invalidation
            );

            return response()->json([
                'message' => 'Product retrieved successfully',
                'data' => ProductResource::collection($products)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve Product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProductsBatchInternal(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'integer'
        ]);

        // Cache batch requests too
        $cacheKey = $this->cacheService->generateKey('products:batch', [
            'ids' => implode(',', $request->product_ids)
        ]);

        $products = $this->cacheService->remember(
            $cacheKey,
            900, // 15 minutes
            function () use ($request) {
                return Product::whereIn('id', $request->product_ids)
                    ->select('id', 'name')
                    ->get();
            },
            'products:batch'
        );

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    public function getProductsBatchForTopSelling(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'integer'
        ]);

        // Cache top-selling products
        $cacheKey = $this->cacheService->generateKey('products:top-selling', [
            'ids' => implode(',', $request->product_ids)
        ]);

        $products = $this->cacheService->remember(
            $cacheKey,
            600, // 10 minutes (shorter TTL for frequently changing data)
            function () use ($request) {
                return Product::whereIn('id', $request->product_ids)
                    ->select('id', 'name', 'sku', 'price', 'sale_price', 'brand', 'category_id')
                    ->with([
                        'category:id,name',
                        'images' => function ($query) {
                            $query->select('id', 'product_id', 'image_url', 'is_primary')
                                ->orderBy('is_primary', 'desc')
                                ->orderBy('created_at', 'asc')
                                ->limit(1);
                        },
                        'stock' => function ($query) {
                            $query->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
                                ->groupBy('product_id');
                        }
                    ])
                    ->get()
                    ->map(function ($product) {
                        $stockQuantity = $product->stock ? $product->stock->quantity : 0;

                        return [
                            'id' => $product->id,
                            'name' => $product->name,
                            'sku' => $product->sku,
                            'price' => $product->price,
                            'sale_price' => $product->sale_price,
                            'brand' => $product->brand,
                            'category' => $product->category ? [
                                'id' => $product->category->id,
                                'name' => $product->category->name
                            ] : null,
                            'primary_image' => $product->images->first() ? [
                                'url' => $product->images->first()->image_url,
                                'is_primary' => $product->images->first()->is_primary
                            ] : null,
                            'current_stock' => $stockQuantity,
                            'is_in_stock' => $stockQuantity > 0
                        ];
                    });
            },
            'products:top-selling'
        );

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $productData = $request->except('images');
            $product = Product::create($productData);

            // Handle image uploads
            $uploadedImages = [];
            $isFirstImage = true;

            if ($request->hasFile('images')) {
                $images = $request->file('images');
                if (!is_array($images)) {
                    $images = [$images];
                }

                foreach ($images as $index => $imageFile) {
                    try {
                        $result = cloudinary()->uploadApi()->upload($imageFile->getRealPath(), [
                            'folder' => 'products'
                        ]);
                        $productImage = $this->createProductImage($product, $result, $isFirstImage);
                        $uploadedImages[] = $productImage;
                        $isFirstImage = false;
                    } catch (\Exception $e) {
                        // Handle error
                    }
                }
            } elseif ($request->has('images') && is_array($request->images)) {
                foreach ($request->images as $index => $imageData) {
                    try {
                        if (isset($imageData['data'])) {
                            $result = cloudinary()->uploadApi()->upload($imageData['data'], [
                                'folder' => 'flutter-products'
                            ]);
                            $productImage = $this->createProductImage($product, $result, $isFirstImage);
                            $uploadedImages[] = $productImage;
                            $isFirstImage = false;
                        }
                    } catch (\Exception $e) {
                        Log::error("Failed to process image data {$index}: " . $e->getMessage());
                    }
                }
            } else {
                Log::warning('No images to process or unsupported format');
            }

            DB::commit();

            // 🚨 CLEAR CACHE after creating product
            $this->cacheService->clearByTag('products');
            $this->cacheService->clearByTag("product:{$product->id}");

            $product->load('images');

            return response()->json([
                'message' => 'Product created successfully',
                'data' => new ProductResource($product),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Function handle create product image
    private function createProductImage($product, $cloudinaryResult, $isPrimary)
    {
        return ProductImage::create([
            'product_id' => $product->id,
            'image_url' => $cloudinaryResult['secure_url'],
            'image_public_id' => $cloudinaryResult['public_id'],
            'is_primary' => $isPrimary,
        ]);
    }

    public function show($id): JsonResponse
    {
        try {
            // Cache single product
            $cacheKey = $this->cacheService->generateKey("product:{$id}");

            $product = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () use ($id) {
                    return Product::with(['images', 'category'])->find($id);
                },
                "product:{$id}"  // Tag for this specific product
            );

            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            return response()->json([
                'message' => 'Product retrieved successfully',
                'data' => new ProductResource($product)  // Use Resource
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve product.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Function handle update product image
    private function updateProductImage(Product $product, $cloudinaryResult, $isPrimary = false)
    {
        $image = $product->images()->create([
            'image_url' => $cloudinaryResult['secure_url'],
            'image_public_id' => $cloudinaryResult['public_id'],
            'is_primary' => $isPrimary,
        ]);
        return $image;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $product = Product::find($id);
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            // Update basic product data
            $productData = $request->except('images');
            $product->update($productData);

            // Handle image uploads
            $uploadedImages = [];
            $isFirstImage = true;

            $existingImagesCount = $product->images()->count();
            $isFirstImage = $existingImagesCount === 0;

            if ($request->hasFile('images')) {
                $images = $request->file('images');
                if (!is_array($images)) {
                    $images = [$images];
                }

                foreach ($images as $index => $imageFile) {
                    try {
                        $result = cloudinary()->uploadApi()->upload($imageFile->getRealPath(), [
                            'folder' => 'products'
                        ]);
                        $productImage = $this->updateProductImage($product, $result, $isFirstImage);
                        $uploadedImages[] = $productImage;
                        $isFirstImage = false;
                    } catch (\Exception $e) {
                        // Handle error
                    }
                }
            } elseif ($request->has('images') && is_array($request->images)) {
                foreach ($request->images as $index => $imageData) {
                    try {
                        if (isset($imageData['data'])) {
                            $result = cloudinary()->uploadApi()->upload($imageData['data'], [
                                'folder' => 'flutter-products'
                            ]);
                            $productImage = $this->updateProductImage($product, $result, $isFirstImage);
                            $uploadedImages[] = $productImage;
                            $isFirstImage = false;
                        }
                    } catch (\Exception $e) {
                        Log::error("Failed to process image data {$index} in update: " . $e->getMessage());
                    }
                }
            } else {
                Log::warning('No new images to process in update');
            }

            DB::commit();

            // 🚨 CLEAR CACHE after updating product
            $this->cacheService->clearByTag('products');
            $this->cacheService->clearByTag("product:{$id}");
            $this->cacheService->clearByTag('products:batch');
            $this->cacheService->clearByTag('products:top-selling');

            // Reload the product with images
            $product->load('images');

            return response()->json([
                'message' => 'Product updated successfully.',
                'data' => new ProductResource($product)  // Fixed typo: 'date' to 'data'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update product.',
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
            DB::beginTransaction();

            $product = Product::find($id);
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            // 1️⃣ Delete product images from Cloudinary
            foreach ($product->images as $image) {
                try {
                    if ($image->image_public_id) {
                        cloudinary()->uploadApi()->destroy($image->image_public_id);
                    } else {
                        Log::warning('Image missing public_id', ['image_id' => $image->id]);
                    }
                    $image->delete();
                } catch (\Exception $e) {
                    // Continue with other images even if one fails
                }
            }

            // 2️⃣ Delete the product itself
            $product->delete();

            // 🚨 CLEAR CACHE after deleting product
            $this->cacheService->clearByTag('products');
            $this->cacheService->clearByTag("product:{$id}");
            $this->cacheService->clearByTag('products:batch');
            $this->cacheService->clearByTag('products:top-selling');

            DB::commit();

            return response()->json([
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete product.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
