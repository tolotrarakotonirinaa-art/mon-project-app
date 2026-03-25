<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $fillable = ['sender','avatar','message','channel','time','user_id'];
    public function user() { return $this->belongsTo(User::class); }
}
