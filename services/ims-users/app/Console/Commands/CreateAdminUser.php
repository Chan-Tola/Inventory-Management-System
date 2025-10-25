<?php

namespace App\Console\Commands;

// use App\Models\Role;\
use Spatie\Permission\Models\Role;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-admin-user';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a default admin user with staff information and assign Admin role';

    /**
     * Execute the console command.
     */
    public function handle()
    {

        $this->info('Creating Admin user...');

        // user data
        $user = User::create([
            User::NAME => 'Chantola',
            User::EMAIL => 'admin123@gmail.com',
            User::PASSWORD => Hash::make('chantola123'),
            User::IS_ACTIVE => true,
        ]);
        // Create staff info
        $staffCode = 'STF' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        // staff data
        $staff = Staff::create([
            Staff::USER_ID => $user->id,
            Staff::STAFF_CODE => $staffCode,
            Staff::PHONE => '0123456789',
            Staff::GENDER => 'male',
            Staff::ADDRESS => 'Phnom Penh',
            Staff::SALARY => 1500,
            Staff::HIRE_DATE => now(),
        ]);
        // Assign Role 
        $role = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'api']);
        $user->assignRole($role);
        // Create User
        $this->info('✅ Admin user created successfully!');
        $this->info('Email: admin123@gmail.com');
        $this->info('Password: chantola123');

        return Command::SUCCESS;
    }
}
