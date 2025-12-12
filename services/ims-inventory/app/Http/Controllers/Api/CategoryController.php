<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    private $cacheService;

    // Inject CacheService in constructor
    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }
    
    public function index(): JsonResponse
    {
        try {
            $categories = Category::select('id', 'name', 'description', 'staff_id')->get();
            return response()->json([
                'message' => 'Categories retrieved successfully',
                'data' => CategoryResource::collection($categories)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // public function index(): JsonResponse
    // {
    //     try {
    //         // 1. Generate cache key
    //         $cacheKey = $this->cacheService->generateKey('categories');

    //         // 2. Use cache - this is how you call it!
    //         $categories = $this->cacheService->remember(
    //             $cacheKey,           // Cache key
    //             1800,                // TTL in seconds (30 minutes)
    //             function () {        // Callback function that runs if cache misses
    //                 return Category::select('id', 'name', 'description', 'staff_id')->get();
    //             },
    //             'categories'         // Tag for easy invalidation
    //         );

    //         return response()->json([
    //             'message' => 'Categories retrieved successfully',
    //             'data' => $categories
    //         ], 200);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'Failed to retrieved categories',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }


    public function store(StoreCategoryRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $category = Category::create($request->validated());

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
            $category = Category::find($id);
            if (!$category) {
                return response()->json(['message' => 'Category not found'], 404);
            }
            return response()->json([
                'message' => 'Category retrieved successfully',
                'data' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieved category.',
                'error' =>  $e->getMessage()
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
