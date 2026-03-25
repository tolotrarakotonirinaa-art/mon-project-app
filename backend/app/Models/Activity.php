<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = ['user','action','icon','color','time','user_id'];
    public function userModel() { return $this->belongsTo(User::class, 'user_id'); }
}
