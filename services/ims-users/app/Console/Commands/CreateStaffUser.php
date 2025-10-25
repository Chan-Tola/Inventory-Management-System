<?php

namespace App\Console\Commands;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class CreateStaffUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-staff-user';

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
        //        $this->info('Creating Admin user...');

        // user data
        $user = User::create([
            User::NAME => 'Van Nak',
            User::EMAIL => 'staff123@gmail.com',
            User::PASSWORD => Hash::make('NakNak123'),
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
            Staff::SALARY => 500,
            Staff::HIRE_DATE => now(),
        ]);
        // Assign Role 
        $role = Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'api']);
        $user->assignRole($role);
        // Create User
        $this->info('✅ Staff user created successfully!');
        $this->info('Email: staff123@gmail.com');
        $this->info('Password: NakNak123');

        return Command::SUCCESS;
    }
}
