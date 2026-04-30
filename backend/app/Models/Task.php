<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Task extends Model
{
    protected $fillable = [
        'title',
        'description',
        'project',
        'project_id',
        'status',
        'priority',
        'assignee',
        'due_date',
        'terminee',
        'created_by',
    ];

    protected $casts = [
        'due_date' => 'date',
        'terminee' => 'boolean',
    ];

    // ─────────────────────────────────────────────────────
    //  STATUT AUTOMATIQUE
    //  Calculé selon due_date sy terminee — tsy manuel
    // ─────────────────────────────────────────────────────
    public function getStatutAttribute(): string
    {
        // 1. Raha efa marquery terminee = true → done
        if ($this->terminee) {
            return 'done';
        }

        $now  = Carbon::now()->startOfDay();
        $due  = $this->due_date ? Carbon::parse($this->due_date)->startOfDay() : null;

        // 2. Raha tsy misy due_date → todo
        if (!$due) {
            return 'todo';
        }

        // 3. Raha efa lasa ny due_date → en_retard
        if ($now->greaterThan($due)) {
            return 'en_retard';
        }

        // 4. Raha due_date dia anio na ampitso (7 andro) → en_cours
        if ($now->diffInDays($due) <= 7) {
            return 'inprogress';
        }

        // 5. Raha mbola lavitra → todo
        return 'todo';
    }

    // ─────────────────────────────────────────────────────
    //  PROGRESSION AUTO ho an'ny projet
    //  Atao rehefa manova terminee na status
    // ─────────────────────────────────────────────────────
    public function recalculateProjectProgress(): void
    {
        if (!$this->project_id) return;

        $project = Project::find($this->project_id);
        if (!$project) return;

        $total    = Task::where('project_id', $this->project_id)->count();
        $terminee = Task::where('project_id', $this->project_id)
                        ->where('terminee', true)
                        ->count();

        if ($total === 0) {
            $progress = 0;
        } else {
            $progress = (int) round(($terminee / $total) * 100);
        }

        // Manova progress raha tsy override manuel
        // Override manuel: raha progress_manuel = true ao amin'ny project
        if (!$project->progress_manuel) {
            $project->update(['progress' => $progress]);
        }
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
}