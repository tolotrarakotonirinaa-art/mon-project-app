<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PipelineStatus extends Model
{
    protected $table    = 'pipeline_status';
    protected $fillable = ['checkout','tests','build','deploy'];
}
