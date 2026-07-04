<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Task extends Model
{
    protected $fillable = [
        'title',
        'description',
        // ✅ 'project' VARCHAR(10) SUPPRIMÉ — cause SQLSTATE[22001]
        'project_id',   // ✅ integer uniquement
        'status',
        'priority',
        'assignee',     // ✅ sera migré en VARCHAR(255)
        'assignee_id',  // ✅ AJOUTÉ — manquait dans fillable
        'due_date',
        'date_debut',   // ✅ AJOUTÉ — manquait dans fillable
        'terminee',
        'created_by',
    ];

    protected $casts = [
        'due_date'    => 'date',
        'date_debut'  => 'date',   // ✅ AJOUTÉ
        'terminee'    => 'boolean',
        'project_id'  => 'integer',
        'assignee_id' => 'integer', // ✅ AJOUTÉ
        'created_by'  => 'integer',
    ];

    // ─────────────────────────────────────────────────────
    //  STATUT AUTOMATIQUE
    // ─────────────────────────────────────────────────────
    public function getStatutAttribute(): string
    {
        if ($this->terminee || $this->status === 'done') {
            return 'done';
        }

        if ($this->status === 'cancelled') {
            return 'cancelled';
        }

        $now   = Carbon::now()->startOfDay();
        $start = $this->date_debut ? Carbon::parse($this->date_debut)->startOfDay() : null;
        $due   = $this->due_date   ? Carbon::parse($this->due_date)->startOfDay()   : null;

        // Echéance dépassée → overdue
        if ($due && $now->greaterThan($due)) {
            return 'overdue';
        }

        // Date début atteinte → inprogress
        if ($start && $start->lessThanOrEqualTo($now)) {
            return 'inprogress';
        }

        // Date début future → todo
        if ($start && $start->greaterThan($now)) {
            return 'todo';
        }

        // Pas de dates → status manuel
        return $this->status ?? 'todo';
    }

    // ─────────────────────────────────────────────────────
    //  PROGRESSION AUTO projet
    // ─────────────────────────────────────────────────────
    public function recalculateProjectProgress(): void
    {
        if (!$this->project_id) return;

        $project = Project::find($this->project_id);
        if (!$project || $project->progress_manuel) return;

        $total = Task::where('project_id', $this->project_id)->count();
        $done  = Task::where('project_id', $this->project_id)
                     ->where('status', 'done')
                     ->count();

        $progress = $total === 0 ? 0 : (int) round(($done / $total) * 100);
        $project->update(['progress' => $progress]);
    }

    // ─────────────────────────────────────────────────────
    //  RELATIONS
    // ─────────────────────────────────────────────────────
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function projet()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function assigneeUser()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }
}