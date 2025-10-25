<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    // note: table name
    const TABLENAME = 'customers';
    const ID = 'id';
    const CUSTOMER_CODE = 'customer_code';
    const GENDER = 'gender';
    const PHONE = 'phone';
    const ADDRESS = 'address';
    // note: table 
    protected $table = self::TABLENAME;

    // note: fk relation to users table
    const USER_ID = 'user_id';

    // note: filleable fields
    protected $filable = [
        self::USER_ID,
        self::CUSTOMER_CODE,
        self::GENDER,
        self::PHONE,
        self::ADDRESS,
    ];

    // note: relation to user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
