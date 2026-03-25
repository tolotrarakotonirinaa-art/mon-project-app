<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Repository extends Model
{
    protected $fillable = ['name','description','visibility','lang','url','stars','forks','branches','created_by'];
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
