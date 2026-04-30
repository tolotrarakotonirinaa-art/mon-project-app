<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'name',
        'description',
        'objectifs',
        'technologies',
        'responsable',
        'status',
        'progress',
        'start_date',
        'end_date',
        'date_debut',
        'date_fin_prevue',
        'color',
        'team',
        'tags',
        'created_by',
    ];

    protected $casts = [
        'team'            => 'array',
        'tags'            => 'array',
        'start_date'      => 'date',
        'end_date'        => 'date',
        'date_debut'      => 'date',
        'date_fin_prevue' => 'date',
        'progress'        => 'integer',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope — filtrer projets selon role utilisateur
     * Admin    → projets rehetra
     * Dev/Client → projets misy azy ao amin'ny team na noforoniny
     */
    public function scopeAccessibles($query, $user)
    {
        if ($user->role === 'admin') {
            return $query;
        }

        return $query->where(function($q) use ($user) {
            $q->whereJsonContains('team', $user->id)
              ->orWhere('created_by', $user->id);
        });
    }

    /**
     * Manamarina raha manana acces amin'ilay projet ilay user
     */
    public function isAccessibleBy($user): bool
    {
        if ($user->role === 'admin') return true;
        if ($this->created_by === $user->id) return true;
        if (is_array($this->team) && in_array($user->id, $this->team)) return true;
        return false;
    }
}