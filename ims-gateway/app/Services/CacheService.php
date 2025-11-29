<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CacheService
{
    /**
     * Safe cache retrieval with fallback
     */
    public function remember(string $key, int $ttl, callable $callback)
    {
        try {
            return Cache::remember($key, $ttl, $callback);
        } catch (\Exception $e) {
            // If Redis fails, just execute the callback (database call)
            Log::warning('Redis cache failed, using direct call', [
                'error' => $e->getMessage(),
                'key' => $key
            ]);
            return $callback();
        }
    }

    /**
     * Safe cache invalidation
     */
    public function forget(string $key): void
    {
        try {
            Cache::forget($key);
        } catch (\Exception $e) {
            Log::warning('Failed to clear cache', [
                'error' => $e->getMessage(),
                'key' => $key
            ]);
        }
    }

    /**
     * Generate unique cache key based on request
     */
    public function generateKey(string $prefix, array $params = []): string
    {
        $key = $prefix;

        if (!empty($params)) {
            ksort($params);
            $key .= ':' . md5(http_build_query($params));
        }

        return $key;
    }

    /**
     * Clear all cache with a specific prefix
     */
    // public function clearByPrefix(string $prefix): void
    // {
    //     try {
    //         $this->forget($prefix);
    //         // For pattern clearing, you might need to implement differently
    //         // This simple approach is safer for Docker environment
    //     } catch (\Exception $e) {
    //         Log::warning('Failed to clear cache by prefix', [
    //             'error' => $e->getMessage(),
    //             'prefix' => $prefix
    //         ]);
    //     }
    // }
    /**
     * Clear all cache with a specific prefix
     */
    public function clearByPrefix(string $prefix): void
    {
        try {
            // If using Redis, we can clear by pattern
            if (config('cache.default') === 'redis') {
                $redis = Cache::getRedis();

                // Clear all keys starting with the prefix
                $pattern = "*{$prefix}*";
                $keys = $redis->keys($pattern);

                foreach ($keys as $key) {
                    // Remove the Laravel database prefix if present
                    $cleanKey = str_replace('laravel_database_', '', $key);
                    Cache::forget($cleanKey);
                }

                Log::info("Cleared cache pattern: {$pattern}", ['keys_count' => count($keys)]);
            } else {
                // Fallback for file/database cache
                Cache::forget($prefix);
            }
        } catch (\Exception $e) {
            Log::warning('Failed to clear cache by prefix', [
                'error' => $e->getMessage(),
                'prefix' => $prefix
            ]);
        }
    }
}
