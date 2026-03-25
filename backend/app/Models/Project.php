<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['name','description','status','progress','start_date','end_date','color','team','tags','created_by'];
    protected $casts    = ['team' => 'array', 'tags' => 'array', 'start_date' => 'date', 'end_date' => 'date'];
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
