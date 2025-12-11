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

class CategoryController extends Controller
{
    private $cacheService;

    // Inject CacheService in constructor
    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }
    // public function index(): JsonResponse
    // {
    //     try {
    //         $categories = Category::select('id', 'name', 'description', 'staff_id')->get();
    //         return response()->json([
    //             'message' => 'Categories retrieved successfully',
    //             'data' => CategoryResource::collection($categories)
    //         ], 200);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'Failed to retrieved categories',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    public function index(Request $request): JsonResponse  // ADD Request parameter
    {
        try {
            // Generate cache key with query params
            $cacheKey = $this->cacheService->generateKey('categories', $request->query());

            $categories = $this->cacheService->remember(
                $cacheKey,
                1800,
                function () use ($request) {
                    // You can add filters here if needed
                    return Category::select('id', 'name', 'description', 'staff_id')->get();
                },
                'categories'
            );

            return response()->json([
                'message' => 'Categories retrieved successfully',
                'data' => CategoryResource::collection($categories)  // Use Resource here
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

            // 🚨 IMPORTANT: Clear cache after creating
            $this->cacheService->clearByTag('categories');

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

    // public function show($id): JsonResponse
    // {
    //     try {
    //         $category = Category::find($id);
    //         if (!$category) {
    //             return response()->json(['message' => 'Category not found'], 404);
    //         }
    //         return response()->json([
    //             'message' => 'Category retrieved successfully',
    //             'data' => $category
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'Failed to retrieved category.',
    //             'error' =>  $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function show($id): JsonResponse
    {
        try {
            // Add caching for single category too
            $cacheKey = $this->cacheService->generateKey("category:{$id}");

            $category = $this->cacheService->remember(
                $cacheKey,
                1800,
                function () use ($id) {
                    return Category::find($id);
                },
                "category:{$id}"
            );

            if (!$category) {
                return response()->json(['message' => 'Category not found'], 404);
            }

            return response()->json([
                'message' => 'Category retrieved successfully',
                'data' => new CategoryResource($category)  // Use Resource
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

            //  the request is already validated at this point from (UpdateCategoryRequest method)
            $category->update($request->validated());
            // 🚨 IMPORTANT: Clear cache after updating
            $this->cacheService->clearByTag('categories');
            $this->cacheService->clearByTag("category:{$id}");

            DB::commit();
            return response()->json([
                'message' => 'Category update successfully',
                'data' => new CategoryResource($category)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to updated category.',
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

            // 🚨 IMPORTANT: Clear cache after deleting
            $this->cacheService->clearByTag('categories');
            $this->cacheService->clearByTag("category:{$id}");

            DB::commit();
            return response()->json([
                'message' => 'Category deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to deleted category.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
