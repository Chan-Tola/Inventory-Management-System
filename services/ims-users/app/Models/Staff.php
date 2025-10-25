<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class Staff extends Model
{
    use HasFactory, Notifiable, HasRoles; // Spatie
    const TABLENAME = 'staffs';
    protected $table = self::TABLENAME;
    const ID = 'id';
    const STAFF_CODE = 'staff_code';
    const GENDER = 'gender';
    const PHONE = 'phone';
    const ADDRESS = 'address';
    const SALARY = 'salary';
    const HIRE_DATE = 'hire_date';
    // note: fk relation to users table
    const USER_ID = 'user_id';

    protected $fillable = [
        self::USER_ID,
        self::STAFF_CODE,
        self::GENDER,
        self::PHONE,
        self::ADDRESS,
        self::SALARY,
        self::HIRE_DATE,
    ];

    // note: relation to user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // note: relation to products
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
