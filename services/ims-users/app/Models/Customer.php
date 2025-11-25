<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class Customer extends Model
{
    use HasFactory, Notifiable, HasRoles; // Spatie
    // note: table name
    const TABLENAME = 'customers';
    const ID = 'id';
    const CUSTOMER_CODE = 'customer_code';
    const GENDER = 'gender';
    const ADDRESS = 'address';
    // note: table 
    protected $table = self::TABLENAME;

    // note: fk relation to users table
    const USER_ID = 'user_id';

    // note: filleable fields
    protected $fillable = [
        self::USER_ID,
        self::CUSTOMER_CODE,
        self::GENDER,
        self::ADDRESS,
    ];

    // note: relation to user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
