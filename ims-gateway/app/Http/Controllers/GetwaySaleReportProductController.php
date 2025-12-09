<?php

namespace App\Http\Controllers;

use App\Services\CacheService;
use App\Services\SaleReportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class GetwaySaleReportProductController extends Controller
{
    protected $saleReportService;
    protected $cacheService;

    public function __construct(
        SaleReportService $saleReportService,
        CacheService $cacheService,
    ) {
        $this->saleReportService = $saleReportService;
        $this->cacheService = $cacheService;
    }
    /**
     * Handle sale report requests
     * Example calls:
     * GET /api/sale-report?date=2025-12-08
     * GET /api/sale-report?start_date=2025-12-01
     */
    public function getReport(Request $request): JsonResponse
    {
        try {
            // Generate cache key based on request parameters
            $cacheKey = $this->cacheService->generateKey(
                'sale_report',
                $request->all()
            );

            // Cache for 2 minutes
            $reportData = $this->cacheService->remember(
                $cacheKey,
                120, // 2 minutes
                function () use ($request) {
                    // Call order microservice
                    $response = $this->saleReportService->getReport($request->all());
                    return [
                        'data' => $response->json(),
                        'status' => $response->status()
                    ];
                },
                'sale_reports' // Tag for easy cache clearing
            );

            return response()->json(
                $reportData['data'],
                $reportData['status']
            );
        } catch (\Exception $e) {
            Log::error('Sale report error', [
                'error' => $e->getMessage(),
                'params' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch sales report',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
