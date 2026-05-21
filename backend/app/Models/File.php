<?php 
 
namespace App\Models; 
 
use Illuminate\Database\Eloquent\Model; 
use Illuminate\Database\Eloquent\Factories\HasFactory; 
 
class File extends Model 
{ 
    use HasFactory; 
    protected $table = 'depot_files'; 
    protected $fillable = ['name','original_name','path','type','size','description','uploaded_by','user_id']; 
    protected $hidden = ['path']; 
}
