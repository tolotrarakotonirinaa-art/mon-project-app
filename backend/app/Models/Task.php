<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = ['title','description','project','status','priority','assignee','due_date','created_by'];
    protected $casts    = ['due_date' => 'date'];
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
