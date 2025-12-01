<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class TestRedis extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-redis';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Redis Docker connection...');

        try {
            // Test 1: Ping
            $ping = Redis::ping();
            $this->info("✅ Ping: $ping");

            // Test 2: Performance test
            $start = microtime(true);
            for ($i = 0; $i < 100; $i++) {
                Redis::set("test_$i", "value_$i");
                Redis::get("test_$i");
            }
            $time = microtime(true) - $start;
            $this->info("✅ Performance: " . number_format($time, 3) . "s for 100 operations");

            // Test 3: Memory usage
            $info = Redis::info('memory');
            $this->info("✅ Memory used: " . ($info['used_memory_human'] ?? 'N/A'));

            $this->info("\n🎉 Redis Docker is working perfectly!");
        } catch (\Exception $e) {
            $this->error("❌ Failed: " . $e->getMessage());
        }
    }
}
