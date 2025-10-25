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


class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $products = Product::with(['category', 'images'])->get();
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        Log::info('Request data received in inventory:', $request->all());
        Log::info('Request files:', $request->files->all());
        Log::info('Has files:', ['hasFiles' => $request->hasFile('images')]);

        try {
            DB::beginTransaction();

            $productData = $request->except('images');
            $product = Product::create($productData);

            // Handle image uploads
            if ($request->has('images')) {
                $uploadedImages = [];
                $isFirstImage = true;

                // Check if base64 or files
                $isBase64 = isset($request->images[0]['data']);
                $folder = $isBase64 ? 'flutter-products' : 'products';

                foreach ($request->images as $index => $imageData) {
                    if ($isBase64) {
                        // Handle base64 images
                        $base64String = $imageData['data'];
                        $result = cloudinary()->uploadApi()->upload($base64String, [
                            'folder' => $folder
                        ]);
                    } else {
                        // Handle file uploads
                        $image = $request->file('images')[$index];
                        $result = cloudinary()->uploadApi()->upload($image->getRealPath(), [
                            'folder' => $folder
                        ]);
                    }

                    $uploadedFileUrl = $result['secure_url'];
                    $publicId = $result['public_id'];

                    // Create product image record
                    $productImage = ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => $uploadedFileUrl,
                        'image_public_id' => $publicId,
                        'is_primary' => $isFirstImage,
                    ]);

                    $uploadedImages[] = $productImage;
                    $isFirstImage = false;
                }
            }

            DB::commit();
            $product->load('images');

            return response()->json([
                'message' => 'Product created successfully',
                'data' => new ProductResource($product),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Product creation failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $product = Product::find($id);
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
            // note: the request is already validated at this point from (UpdateCategoryRequest method)
            $product->update($request->validated());

            DB::commit();
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
            // 1️⃣ Delete product images from Cloudinary
            foreach ($product->images as $image) {
                if ($image->image_product_public_id) {
                    Cloudinary::destroy($image->image_product_public_id);
                }
                $image->delete(); // Delete image record from DB
            }
            $product->delete();
            DB::commit();
            return response()->json([
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to deleted product.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
