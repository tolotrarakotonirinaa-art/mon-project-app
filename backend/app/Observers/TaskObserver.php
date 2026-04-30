<?php
namespace App\Observers;

use App\Models\Task;

class TaskObserver
{
    /**
     * Rehefa save tâche — calcul statut automatique
     */
    public function saving(Task $task): void
    {
        // Raha terminé na annulé → tsy manova
        if (in_array($task->status, ['done', 'cancelled'])) {
            return;
        }

        $now   = now();
        $start = $task->date_debut ? \Carbon\Carbon::parse($task->date_debut) : null;
        $end   = $task->due_date   ? \Carbon\Carbon::parse($task->due_date)   : null;

        // EN RETARD — date fin dépassée
        if ($end && $now->greaterThan($end)) {
            $task->status = 'overdue';
            return;
        }

        // EN COURS — date début atteinte
        if ($start && $now->greaterThanOrEqualTo($start)) {
            if ($task->status === 'todo') {
                $task->status = 'inprogress';
            }
            return;
        }

        // À FAIRE — date début pas encore atteinte
        if ($start && $now->lessThan($start)) {
            $task->status = 'todo';
        }
    }
}