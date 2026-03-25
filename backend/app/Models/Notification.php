<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['type','message','read','time','user_id'];
    protected $casts    = ['read' => 'boolean'];
    public function user() { return $this->belongsTo(User::class); }
}
