<?php

namespace Database\Seeders;

use Spatie\Permission\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;



class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'api']);
        $staff = Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'api']);
        $customer = Role::firstOrCreate(['name' => 'Customer', 'guard_name' => 'api']);
    }
}
