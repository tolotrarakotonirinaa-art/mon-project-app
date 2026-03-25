<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $fillable = [
        'name', 'email', 'password', 'role',
        'avatar', 'bio', 'join_date'
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'join_date' => 'date',
    ];
}
