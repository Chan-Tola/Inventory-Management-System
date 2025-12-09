<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\TopSellService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class GatewayTopSellProductController extends Controller
{
    protected $TopSaleProductService;
    protected $cacheService;

    public function __construct(
        TopSellService $TopSaleProductService,
        CacheService $cacheService,
    ) {
        $this->TopSaleProductService = $TopSaleProductService;
        $this->cacheService = $cacheService;
    }

    public function getTopSellingProducts(Request $request): JsonResponse
    {
        try {
            // Generate cache key based on request parameters
            $cacheKey = $this->cacheService->generateKey(
                'top_sell',
                $request->all()
            );

            // Cache for 2 minutes
            $reportData = $this->cacheService->remember(
                $cacheKey,
                120, // 2 minutes
                function () use ($request) {
                    // Call order microservice
                    $response = $this->TopSaleProductService->getTopSellingProducts($request->all());
                    return [
                        'data' => $response->json(),
                    ];
                },
                'top_sell' // Tag for easy cache clearing
            );

            return response()->json(
                $reportData['data'],
            );
        } catch (\Exception $e) {
            Log::error('Sale report error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch top sell report',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
