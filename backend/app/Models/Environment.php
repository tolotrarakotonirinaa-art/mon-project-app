<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Environment extends Model
{
    protected $fillable = ['name','type','status','url','version','last_deploy','cpu','memory','created_by'];
    protected $casts    = ['last_deploy' => 'date'];
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
