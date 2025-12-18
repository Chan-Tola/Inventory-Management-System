<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, HasRoles; // Spatie

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    const TABLENAME = 'users';
    const ID = 'id';
    const NAME =  'name';
    const EMAIL = 'email';
    const PASSWORD = 'password';
    const IS_ACTIVE = 'is_active';
    const REMEMBER_TOKEN = 'remember_token';
    const EMAIL_VERIFIED_AT = 'email_verified_at';

    protected $fillable = [
        self::NAME,
        self::EMAIL,
        self::PASSWORD,
        self::IS_ACTIVE,
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        self::PASSWORD,
        self::REMEMBER_TOKEN
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            self::EMAIL_VERIFIED_AT => 'datetime',
            self::PASSWORD => 'hashed',
        ];
    }


    // note: relation to staff
    public function staff()
    {
        return $this->hasOne(Staff::class);
    }
    // note: relation to customer
    public function customer()
    {
        return $this->hasOne(Customer::class);
    }
}
