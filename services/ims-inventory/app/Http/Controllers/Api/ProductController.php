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
use App\Services\CacheService;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    private $cacheService;

    // Inject CacheService in constructor
    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Generate cache key
            $cacheKey = $this->cacheService->generateKey('products', $request->query());

            // Use cache with 30 minutes TTL
            $products = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () {
                    return Product::select('id', 'name', 'sku', 'brand', 'price', 'sale_price', 'category_id', 'description', 'staff_id')
                        ->with([
                            'category:id,name',      // also select only needed category fields
                            'images'
                        ])
                        ->get();
                },
                'products' // Tag for easy clearing
            );

            return response()->json([
                'message' => 'Product retrieved successfully',
                'data' => ProductResource::collection($products)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved Product',
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

        $products = Product::whereIn('id', $request->product_ids)
            ->select('id', 'name')
            ->get();

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

        $products = Product::whereIn('id', $request->product_ids)
            ->select('id', 'name', 'sku', 'price', 'sale_price', 'brand', 'category_id')
            ->with([
                'category:id,name',
                'images' => function ($query) {
                    // Get primary image or first image
                    $query->select('id', 'product_id', 'image_url', 'is_primary')
                        ->orderBy('is_primary', 'desc')
                        ->orderBy('created_at', 'asc')
                        ->limit(1);
                },
                'stock' => function ($query) {
                    // UNCOMMENT THIS - Get current stock quantity
                    $query->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
                        ->groupBy('product_id');
                }
            ])
            ->get()
            ->map(function ($product) {
                // Now $product->stocks will be loaded
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

            // Handle image uploads
            if ($request->hasFile('images')) {
                $images = $request->file('images');
                if (!is_array($images)) {
                    $images = [$images];  // Convert single file to array
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
                        // Handle upload error
                    }
                }
            } elseif ($request->has('images') && is_array($request->images)) {
                foreach ($request->images as $index => $imageData) {
                    try {
                        // Check if it's base64 data
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
            $product->load('images');

            // 🔥 Clear cache after creating product
            $this->clearProductCache();

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

    // function handle create product image
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
            // Generate cache key for specific product
            $cacheKey = $this->cacheService->generateKey("product:{$id}");

            $product = $this->cacheService->remember(
                $cacheKey,
                1800,
                function () use ($id) {
                    return Product::with(['images', 'category'])->findOrFail($id);
                },
                'products' // Changed from 'categories' to 'products'
            );

            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            return response()->json([
                'message' => 'Product retrieved successfully',
                'data' => new ProductResource($product) // Use ProductResource here
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved product.',
                'error' =>  $e->getMessage()
            ], 500);
        }
    }

    // function handle update product image
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

            // Check if we have existing images to determine isFirstImage
            $existingImagesCount  = $product->images()->count();
            $isFirstImage = $existingImagesCount === 0;

            // Handle image upload
            if ($request->hasFile('images')) {
                $images = $request->file('images');
                if (!is_array($images)) {
                    $images = [$images];  // Convert single file to array
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
                        // Handle upload error
                    }
                }
            } elseif ($request->has('images') && is_array($request->images)) {
                foreach ($request->images as $index => $imageData) {
                    try {
                        // Check if it's base64 data
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

            // Reload the product with images
            $product->load('images');

            // 🔥 Clear cache after updating product
            $this->clearProductCache($id);

            return response()->json([
                'message' => 'Product updated successfully.',
                'data' => new ProductResource($product) // Fixed typo: 'date' to 'data'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
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
                    $image->delete(); // Delete image record from DB
                } catch (\Exception $e) {
                    // Continue with other images even if one fails
                }
            }

            // 2️⃣ Delete the product itself
            $product->delete();

            DB::commit();

            // 🔥 Clear cache after deleting product
            $this->clearProductCache($id);

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

    /**
     * Clear product cache
     */
    private function clearProductCache(?int $productId = null): void
    {
        try {
            // Clear specific product if ID provided
            if ($productId) {
                $this->cacheService->forget("product:{$productId}");
            }

            // Clear all product list caches
            $this->cacheService->clearByPrefix('products:');

            // Clear by tag
            $this->cacheService->clearByTag('products');
        } catch (\Exception $e) {
            // Don't fail the operation if cache clearing fails
            Log::warning('Failed to clear product cache', [
                'product_id' => $productId,
                'error' => $e->getMessage()
            ]);
        }
    }
}
