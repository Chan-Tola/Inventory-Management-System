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
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $products = Product::select('id', 'name', 'sku', 'brand', 'price', 'sale_price', 'category_id', 'description', 'staff_id')
                ->with([
                    'category:id,name',      // also select only needed category fields
                    'images'
                ])
                ->get();

            // $products = Product::with(['category', 'images'])->get();
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
                // Log::info('Processing FILE uploads');
                // Get images and normalize to array
                $images = $request->file('images');
                if (!is_array($images)) {
                    $images = [$images];  // Convert single file to array
                }
                // Log::info('Files to process:', ['count' => count($images)]);
                foreach ($images as $index => $imageFile) {
                    try {
                        // Log::info("Uploading file {$index}", [
                        //     'name' => $imageFile->getClientOriginalName(),
                        //     'size' => $imageFile->getSize()
                        // ]);
                        $result = cloudinary()->uploadApi()->upload($imageFile->getRealPath(), [
                            'folder' => 'products'
                        ]);
                        $productImage = $this->createProductImage($product, $result, $isFirstImage);
                        $uploadedImages[] = $productImage;
                        $isFirstImage = false;

                        // Log::info('File uploaded successfully', ['image_id' => $productImage->id]);
                    } catch (\Exception $e) {
                        // Log::error("Failed to upload file {$index}: " . $e->getMessage());
                    }
                }
            } elseif ($request->has('images') && is_array($request->images)) {
                // Log::info('Processing ARRAY data uploads');
                foreach ($request->images as $index => $imageData) {
                    try {
                        // Check if it's base64 data
                        if (isset($imageData['data'])) {
                            // Log::info("Uploading base64 image {$index}");

                            $result = cloudinary()->uploadApi()->upload($imageData['data'], [
                                'folder' => 'flutter-products'
                            ]);

                            $productImage = $this->createProductImage($product, $result, $isFirstImage);
                            $uploadedImages[] = $productImage;
                            $isFirstImage = false;

                            // Log::info('Base64 image uploaded successfully', ['image_id' => $productImage->id]);
                        }
                        // Add other image data types here if needed

                    } catch (\Exception $e) {
                        Log::error("Failed to process image data {$index}: " . $e->getMessage());
                    }
                }
            } else {
                Log::warning('No images to process or unsupported format');
            }

            DB::commit();
            $product->load('images');

            // Log::info('Image processing completed', [
            //     'total_uploaded' => count($uploadedImages),
            //     'product_images_count' => $product->images->count()
            // ]);

            return response()->json([
                'message' => 'Product created successfully',
                'data' => new ProductResource($product),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            // Log::error('Product creation failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // function hanlde create product image
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
            // $product = Product::find($id);
            $product = Product::with(['images', 'category'])->findOrFail($id);
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }
            return response()->json([
                'message' => 'Product retrieved successfully',
                'data' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved product.',
                'error' =>  $e->getMessage()
            ], 500);
        }
    }

    // function handleupdate product image
    private function updateProductImage(Product $product, $cloudinaryResult, $isPrimary = false)
    {
        // Log::info('Creating product image record', [
        //     'product_id' => $product->id,
        //     'cloudinary_url' => $cloudinaryResult['secure_url'],
        //     'public_id' => $cloudinaryResult['public_id'],
        //     'is_primary' => $isPrimary
        // ]);

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
        // Log::info('Update Request data received:', $request->all());
        // Log::info('Update Request files:', $request->files->all());
        // Log::info('Update Has files:', ['hasFiles' => $request->hasFile('images')]);

        try {
            DB::beginTransaction();

            $product = Product::find($id);
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            // Update basic product data
            $productData = $request->except('images');
            $product->update($productData);

            // Handle Image deleted - add this section
            // if ($request('deleted_images') && is_array($request->deleted_images)) {
            //     Log::info('Processing image deletions', [
            //         'deleted_images' => $request->deleted_images
            //     ]);

            //     foreach ($request->deleted_images as $imageId) {
            //         try {
            //             $image = ProductImage::find($imageId);
            //             // Delete from Cloudinary 
            //             if ($image->image_public_id) {
            //                 cloudinary()->uploadApi()->destroy($image->image_public_id);
            //             }
            //             // Delete from database
            //             $image->delete();
            //             Log::info('Image deleted successfully', ['image_id' => $imageId]);
            //         } catch (\Exception $e) {
            //             log::error("Failed to delete image {$imageId}: " . $e->getMessage());
            //         }
            //     }
            // }
            // Handle image uploads - ADD THIS SECTION
            $uploadedImages = [];
            $isFirstImage = true;

            // Check if we have existing images to determine isFirstImage
            $existingImagesCount  = $product->images()->count();
            $isFirstImage = $existingImagesCount === 0;

            // Handle image upload
            if ($request->hasFile('images')) {
                // Log::info('Processing FILE uploads in update');
                // Get images and normalize to array
                $images = $request->file('images');
                if (!is_array($images)) {
                    $images = [$images];  // Convert single file to array
                }
                // Log::info('Files to process in update:', ['count' => count($images)]);

                foreach ($images as $index => $imageFile) {
                    try {
                        // Log::info("Uploading file {$index} in update", [
                        //     'name' => $imageFile->getClientOriginalName(),
                        //     'size' => $imageFile->getSize()
                        // ]);
                        $result = cloudinary()->uploadApi()->upload($imageFile->getRealPath(), [
                            'folder' => 'products'
                        ]);
                        $productImage = $this->updateProductImage($product, $result, $isFirstImage);
                        $uploadedImages[] = $productImage;
                        $isFirstImage = false;

                        // Log::info('File uploaded successfully in update', ['image_id' => $productImage->id]);
                    } catch (\Exception $e) {
                        // Log::error("Failed to upload file {$index} in update: " . $e->getMessage());
                    }
                }
            } elseif ($request->has('images') && is_array($request->images)) {
                // Log::info('Processing ARRAY data uploads in update');
                foreach ($request->images as $index => $imageData) {
                    try {
                        // Check if it's base64 data
                        if (isset($imageData['data'])) {
                            // Log::info("Uploading base64 image {$index} in update");

                            $result = cloudinary()->uploadApi()->upload($imageData['data'], [
                                'folder' => 'flutter-products'
                            ]);

                            $productImage = $this->updateProductImage($product, $result, $isFirstImage);
                            $uploadedImages[] = $productImage;
                            $isFirstImage = false;

                            // Log::info('Base64 image uploaded successfully in update', ['image_id' => $productImage->id]);
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

            // Log::info('Product update completed', [
            //     'total_new_images' => count($uploadedImages),
            //     'product_images_count' => $product->images->count()
            // ]);
            return response()->json([
                'message' => 'Product updated successfully.',
                'date' => new ProductResource($product)
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

            // Log::info('Deleting product', ['product_id' => $id, 'product_name' => $product->name]);

            // 1️⃣ Delete product images from Cloudinary
            foreach ($product->images as $image) {
                try {
                    // FIX: Use the correct field name from your store method
                    if ($image->image_public_id) { // Changed from image_product_public_id
                        // Log::info('Deleting image from Cloudinary', [
                        //     'public_id' => $image->image_public_id
                        // ]);

                        cloudinary()->uploadApi()->destroy($image->image_public_id);
                        // Log::info('Cloudinary image deleted successfully');
                    } else {
                        Log::warning('Image missing public_id', ['image_id' => $image->id]);
                    }

                    $image->delete(); // Delete image record from DB
                    // Log::info('Image record deleted from database', ['image_id' => $image->id]);
                } catch (\Exception $e) {
                    // Log::error('Failed to delete image: ' . $e->getMessage(), [
                    //     'image_id' => $image->id,
                    //     'public_id' => $image->image_public_id
                    // ]);
                    // Continue with other images even if one fails
                }
            }

            // 2️⃣ Delete the product itself
            $product->delete();
            // Log::info('Product deleted successfully', ['product_id' => $id]);

            DB::commit();

            return response()->json([
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            // Log::error('Product deletion failed: ' . $e->getMessage(), ['product_id' => $id]);

            return response()->json([
                'message' => 'Failed to delete product.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
