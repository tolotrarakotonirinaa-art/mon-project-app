<?php
namespace App\Console\Commands;

use App\Models\Task;
use Illuminate\Console\Command;

class UpdateTaskStatuses extends Command
{
    protected $signature   = 'tasks:update-statuses';
    protected $description = 'Met à jour automatiquement les statuts des tâches selon les dates';

    public function handle(): void
    {
        $now = now();

        // EN RETARD — date fin dépassée et pas terminé/annulé
        $overdue = Task::whereNotNull('due_date')
            ->where('due_date', '<', $now)
            ->whereNotIn('status', ['done', 'cancelled', 'overdue'])
            ->update(['status' => 'overdue']);

        // EN COURS — date début atteinte et statut encore "todo"
        $inprogress = Task::whereNotNull('date_debut')
            ->where('date_debut', '<=', $now)
            ->where('status', 'todo')
            ->whereNull('due_date')
            ->orWhere(function($q) use ($now) {
                $q->whereNotNull('date_debut')
                  ->where('date_debut', '<=', $now)
                  ->whereNotNull('due_date')
                  ->where('due_date', '>=', $now)
                  ->where('status', 'todo');
            })
            ->update(['status' => 'inprogress']);

        $this->info("✅ Statuts mis à jour :");
        $this->info("   → En retard  : {$overdue} tâche(s)");
        $this->info("   → En cours   : {$inprogress} tâche(s)");
    }
}