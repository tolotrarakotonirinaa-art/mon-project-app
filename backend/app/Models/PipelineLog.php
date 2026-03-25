<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PipelineLog extends Model
{
    protected $fillable = ['time','text','level','triggered_by'];
    public function triggeredBy() { return $this->belongsTo(User::class, 'triggered_by'); }
}
