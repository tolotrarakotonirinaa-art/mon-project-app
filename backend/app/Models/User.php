<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $fillable = [
        'name', 'email', 'password', 'role',
        'avatar', 'bio', 'join_date',
        'is_validated',   // ← vaovao
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'join_date'    => 'date',
        'is_validated' => 'boolean',  // ← vaovao
    ];

    /**
     * Manamarika raha admin ve ilay user
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Manamarika raha validated ve ilay user
     */
    public function isValidated(): bool
    {
        return $this->is_validated === true;
    }
}