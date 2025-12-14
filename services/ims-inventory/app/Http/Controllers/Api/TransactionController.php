<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Models\Stock;
use App\Services\CacheService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TransactionController extends Controller
{
    private $cacheService;

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            // Generate cache key with all query parameters
            $cacheKey = $this->cacheService->generateKey('transactions', $request->query());

            // Use cache with 30 minutes TTL
            $transactions = $this->cacheService->remember(
                $cacheKey,
                1800, // 30 minutes
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
                        'supplier:id,name,address',
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
                'transactions' // Tag for easy clearing
            );

            return response()->json([
                'message' => 'Transactions retrieved successfully',
                'data' => TransactionResource::collection($transactions)
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve transactions: ' . $e->getMessage());
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

            // 1. Create transaction (Model booted event will handle stock update)
            $transaction = Transaction::create($request->validated());

            // 2. 🔥 Clear cache for affected product
            $this->clearInventoryCache($transaction->product_id);

            DB::commit();

            Log::info('Transaction created successfully', [
                'transaction_id' => $transaction->id,
                'product_id' => $transaction->product_id,
                'type' => $transaction->transaction_type,
                'quantity' => $transaction->quantity
            ]);

            return response()->json([
                'message' => 'Transaction created successfully.',
                'data' => new TransactionResource($transaction->load(['product', 'supplier']))
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction creation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            // Generate cache key for specific transaction
            $cacheKey = $this->cacheService->generateKey("transaction:{$id}");

            $transaction = $this->cacheService->remember(
                $cacheKey,
                1800,
                function () use ($id) {
                    return Transaction::with(['product', 'supplier'])->find($id);
                },
                'transactions'
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

    public function update(Request $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $transaction = Transaction::find($id);
            if (!$transaction) {
                return response()->json([
                    'message' => 'Transaction not found'
                ], 404);
            }

            // Save old product ID for cache clearing
            $oldProductId = $transaction->product_id;

            // Update transaction
            $transaction->update($request->all());

            // 🔥 Clear cache for both old and new product if product changed
            $this->clearInventoryCache($oldProductId);
            if ($oldProductId != $transaction->product_id) {
                $this->clearInventoryCache($transaction->product_id);
            }

            // Also clear transaction cache
            $this->clearTransactionCache($id);

            DB::commit();

            Log::info('Transaction updated successfully', [
                'transaction_id' => $transaction->id,
                'old_product_id' => $oldProductId,
                'new_product_id' => $transaction->product_id,
                'type' => $transaction->transaction_type
            ]);

            return response()->json([
                'message' => 'Transaction updated successfully',
                'data' => new TransactionResource($transaction->load(['product', 'supplier']))
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction update failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $transaction = Transaction::find($id);
            if (!$transaction) {
                return response()->json([
                    'message' => 'Transaction not found'
                ], 404);
            }

            // Save product ID for cache clearing before deletion
            $productId = $transaction->product_id;

            // Delete transaction (Model booted event will handle stock update)
            $transaction->delete();

            // 🔥 Clear cache for affected product
            $this->clearInventoryCache($productId);

            // Also clear transaction cache
            $this->clearTransactionCache($id);

            DB::commit();

            Log::info('Transaction deleted successfully', [
                'transaction_id' => $id,
                'product_id' => $productId
            ]);

            return response()->json([
                'message' => 'Transaction deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction deletion failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeInternal(StoreTransactionRequest $request): JsonResponse
    {
        Log::info('📥 INTERNAL: Transaction creation request received', $request->all());

        $validated = $request->validated();

        DB::beginTransaction();

        try {
            // 1. Create transaction (Model booted event will handle stock update)
            $transaction = Transaction::create($validated);

            // 2. 🔥 Clear cache for affected product
            $this->clearInventoryCache($transaction->product_id);

            DB::commit();

            Log::info('✅ INTERNAL: Transaction created and cache cleared', [
                'transaction_id' => $transaction->id,
                'product_id' => $transaction->product_id,
                'quantity' => $transaction->quantity,
                'type' => $transaction->transaction_type
            ]);

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

            Log::error('💥 INTERNAL: Transaction creation failed', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear all cache related to inventory changes
     */
    private function clearInventoryCache(int $productId): void
    {
        try {
            // Clear specific product caches
            $this->cacheService->forget("product:{$productId}");
            $this->cacheService->forget("stock:{$productId}");

            // Clear list caches that might include this product
            $this->cacheService->clearByPrefix('products:');
            $this->cacheService->clearByPrefix('stocks:');
            $this->cacheService->clearByPrefix('transactions:');
            $this->cacheService->clearByPrefix('categories:');
            $this->cacheService->clearByPrefix('low_stock:');

            // Clear cache tags if using tags
            $this->cacheService->clearByTag('products');
            $this->cacheService->clearByTag('stocks');
            $this->cacheService->clearByTag('transactions');

            Log::info("🧹 Cache cleared for product", [
                'product_id' => $productId,
                'cleared_prefixes' => ['products', 'stocks', 'transactions', 'categories', 'low_stock'],
                'cleared_tags' => ['products', 'stocks', 'transactions']
            ]);
        } catch (\Exception $e) {
            // Don't fail the transaction if cache clearing fails
            Log::warning('Failed to clear cache', [
                'product_id' => $productId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Clear transaction cache
     */
    private function clearTransactionCache(?int $transactionId = null): void
    {
        try {
            // Clear specific transaction if ID provided
            if ($transactionId) {
                $this->cacheService->forget("transaction:{$transactionId}");
            }

            // Clear all transaction list caches
            $this->cacheService->clearByPrefix('transactions:');

            // Clear by tag
            $this->cacheService->clearByTag('transactions');
        } catch (\Exception $e) {
            // Don't fail the operation if cache clearing fails
            Log::warning('Failed to clear transaction cache', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage()
            ]);
        }
    }
}
