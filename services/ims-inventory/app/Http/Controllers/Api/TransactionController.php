<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Services\CacheService;  // ADD THIS LINE
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class TransactionController extends Controller
{
    private $cacheService;

    // ADD CONSTRUCTOR
    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            // ADD CACHING
            $cacheKey = $this->cacheService->generateKey('transactions', $request->all());

            $data = $this->cacheService->remember(
                $cacheKey,
                600, // 10 minutes (transactions change frequently)
                function () use ($request) {
                    $query = Transaction::select([
                        'id',
                        'transaction_type',
                        'quantity',
                        'transaction_date',
                        'notes',
                        'amount',
                        'money_type',
                        'product_id',
                        'supplier_id',
                        'staff_id',
                    ])->with([
                        'product:id,name',
                        'supplier:id,name',
                    ])->latest();

                    // Filter by product_id
                    if ($request->has('product_id')) {
                        $query->where('product_id', $request->product_id);
                    }

                    // Filter by transaction_type
                    if ($request->has('transaction_type')) {
                        $query->where('transaction_type', $request->transaction_type);
                    }

                    // Filter by date range
                    if ($request->has('start_date') && $request->has('end_date')) {
                        $query->whereBetween('transaction_date', [
                            $request->start_date,
                            $request->end_date
                        ]);
                    }

                    return $query->paginate(20);
                },
                'transactions'
            );

            return response()->json([
                'message' => 'Transactions retrieved successfully',
                'data' => TransactionResource::collection($data)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();
            $transaction = Transaction::create($request->validated());

            DB::commit();

            // ADD CACHE CLEARING
            $this->cacheService->clearByTag('transactions');
            $this->cacheService->clearByTag("transaction:{$transaction->id}");
            $this->cacheService->clearByTag("product:{$transaction->product_id}:transactions");

            // Also clear product-related caches since transaction affects product stock
            $this->cacheService->clearByTag('products');
            $this->cacheService->clearByTag("product:{$transaction->product_id}");
            $this->cacheService->clearByTag('stocks');

            return response()->json([
                'message' => 'Transaction created successfully.',
                'data' => new TransactionResource($transaction->load(['product', 'supplier']))
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            // ADD CACHING
            $cacheKey = $this->cacheService->generateKey("transaction:{$id}");

            $transaction = $this->cacheService->remember(
                $cacheKey,
                600, // 10 minutes
                function () use ($id) {
                    return Transaction::with(['product', 'supplier'])->find($id);
                },
                "transaction:{$id}"
            );

            if (!$transaction) {
                return response()->json([
                    'message' => 'Transaction not found'
                ], 404);
            }

            return response()->json([
                'message' => 'Transaction retrieved successfully',
                'data' => new TransactionResource($transaction)
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve transaction: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve transaction.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeInternal(StoreTransactionRequest $request)
    {
        $validated = $request->validated();

        DB::beginTransaction();

        try {
            $transaction = Transaction::create($validated);

            DB::commit();

            // ADD CACHE CLEARING FOR INTERNAL TOO
            $this->cacheService->clearByTag('transactions');
            $this->cacheService->clearByTag("transaction:{$transaction->id}");
            $this->cacheService->clearByTag("product:{$transaction->product_id}:transactions");

            // Also clear product-related caches
            $this->cacheService->clearByTag('products');
            $this->cacheService->clearByTag("product:{$transaction->product_id}");
            $this->cacheService->clearByTag('stocks');

            return response()->json([
                'success' => true,
                'message' => 'Transaction created successfully',
                'data' => [
                    'id' => $transaction->id,
                    'transaction_type' => $transaction->transaction_type,
                    'product_id' => $transaction->product_id,
                    'quantity' => $transaction->quantity,
                    'amount' => $transaction->amount,
                    'created_at' => $transaction->created_at
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create transaction: ' . $e->getMessage()
            ], 500);
        }
    }
}
