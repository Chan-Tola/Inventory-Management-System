<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    private $cacheService;

    // Inject CacheService in constructor
    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Get all categories with cache
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Generate cache key
            $cacheKey = $this->cacheService->generateKey('categories', $request->query());

            // Use cache with 30 minutes TTL
            $categories = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
                function () {
                    return Category::select('id', 'name', 'description', 'staff_id')->get();
                },
                'categories' // Tag for easy clearing
            );

            return response()->json([
                'message' => 'Categories retrieved successfully',
                'data' => CategoryResource::collection($categories)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $category = Category::create($request->validated());

            // 🔥 Clear cache after creating
            $this->clearCategoryCache();

            DB::commit();

            return response()->json([
                'message' => 'Category created successfully.',
                'data' => new CategoryResource($category)
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            // Generate cache key for specific category
            $cacheKey = $this->cacheService->generateKey("category:{$id}");

            $category = $this->cacheService->remember(
                $cacheKey,
                1800,
                function () use ($id) {
                    return Category::find($id);
                },
                'categories'
            );

            if (!$category) {
                return response()->json(['message' => 'Category not found'], 404);
            }

            return response()->json([
                'message' => 'Category retrieved successfully',
                'data' => new CategoryResource($category)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve category.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(UpdateCategoryRequest $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $category = Category::find($id);

            if (!$category) {
                return response()->json(['message' => 'Category not found'], 404);
            }

            $category->update($request->validated());

            // 🔥 Clear cache after updating
            $this->clearCategoryCache($id);

            DB::commit();

            return response()->json([
                'message' => 'Category updated successfully',
                'data' => new CategoryResource($category)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update category.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $category = Category::find($id);

            if (!$category) {
                return response()->json(['message' => 'Category not found'], 404);
            }

            $category->delete();

            // 🔥 Clear cache after deleting
            $this->clearCategoryCache($id);

            DB::commit();

            return response()->json([
                'message' => 'Category deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete category.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function clearCategoryCache(?int $categoryId = null): void
    {
        try {
            // Clear specific category if ID provided
            if ($categoryId) {
                $this->cacheService->forget("category:{$categoryId}");
            }

            // Clear all category list caches
            $this->cacheService->clearByPrefix('categories:');

            // Clear by tag
            $this->cacheService->clearByTag('categories');
        } catch (\Exception $e) {
            // Don't fail the operation if cache clearing fails
            Log::warning('Failed to clear category cache', [
                'category_id' => $categoryId,
                'error' => $e->getMessage()
            ]);
        }
    }
}
