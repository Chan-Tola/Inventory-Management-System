<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Transaction::with(['product', 'supplier']);

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

            $transactions = $query->latest()->paginate(20);

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
            $transaction = Transaction::create($request->validated());

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
            ]);
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
            $transaction = Transaction::with(['product', 'supplier'])->find($id);

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
        Log::info('📥 INTERNAL: Transaction creation request received', $request->all());

        $validated = $request->validated(); // clean

        DB::beginTransaction();

        try {
            $transaction = Transaction::create($validated);

            Log::info('✅ INTERNAL: Transaction created', [
                'transaction_id' => $transaction->id,
                'product_id' => $transaction->product_id,
                'quantity' => $transaction->quantity
            ]);

            DB::commit();

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
}
