<?php
namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends BaseController
{
    // ─────────────────────────────────────────────────────
    //  INDEX
    // ─────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = Task::query();

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('project_id')) {
            $query->where('project_id', (int) $request->project_id);
        }
        if ($request->filled('project')) {
            $query->where('project_id', (int) $request->project);
        }
        if ($request->filled('assignee_id')) {
            $query->where('assignee_id', (int) $request->assignee_id);
        }

        $tasks = $query->orderBy('created_at', 'desc')->get();
        $tasks = $tasks->map(fn($t) => $this->formatTask($t));

        // Filtre status après format (statut automatique)
        if ($request->filled('status')) {
            $tasks = $tasks->filter(fn($t) => $t['status'] === $request->status)->values();
        }

        return $this->success($tasks);
    }

    // ─────────────────────────────────────────────────────
    //  SHOW
    // ─────────────────────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $task = Task::find($id);
        if (!$task) return $this->notFound('Tâche introuvable');
        return $this->success($this->formatTask($task));
    }

    // ─────────────────────────────────────────────────────
    //  STORE — Créer tâche
    //  ✅ FIX : 'project' VARCHAR(10) supprimé — project_id uniquement
    // ─────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();

        $request->validate([
            'title'       => 'required|string|min:2|max:200',
            'project_id'  => 'required|integer|exists:projects,id',
            'description' => 'sometimes|nullable|string',
            'priority'    => 'sometimes|in:low,medium,high,urgent',
            'status'      => 'sometimes|in:todo,inprogress,review,done',
            'assignee_id' => 'sometimes|nullable|integer|exists:users,id',
            'due_date'    => 'sometimes|nullable|date',
            'date_debut'  => 'sometimes|nullable|date',
        ]);

        $user = $this->authUser($request);

        // Nom de l'assigné depuis assignee_id
        $assigneeName = '';
        if ($request->filled('assignee_id')) {
            $assigneeUser = User::find((int) $request->input('assignee_id'));
            $assigneeName = $assigneeUser?->name ?? '';
        }

        $task = Task::create([
            'title'       => trim($request->title),
            'description' => $request->input('description', '') ?? '',
            'project_id'  => (int) $request->input('project_id'),
            // ✅ 'project' VARCHAR(10) SUPPRIMÉ — cause de l'erreur SQLSTATE[22001]
            'status'      => $request->input('status', 'todo'),
            'priority'    => $request->input('priority', 'medium'),
            'assignee_id' => $request->filled('assignee_id') ? (int) $request->input('assignee_id') : null,
            'assignee'    => $assigneeName,
            'due_date'    => $request->input('due_date') ?: null,
            'date_debut'  => $request->input('date_debut') ?: null,
            'terminee'    => false,
            'created_by'  => (int) $user['id'],
        ]);

        return $this->created($this->formatTask($task), 'Tâche créée');
    }

    // ─────────────────────────────────────────────────────
    //  UPDATE
    // ─────────────────────────────────────────────────────
    public function update(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();

        $task = Task::find($id);
        if (!$task) return $this->notFound('Tâche introuvable');

        $request->validate([
            'title'       => 'sometimes|required|string|min:2|max:200',
            'description' => 'sometimes|nullable|string',
            'project_id'  => 'sometimes|integer|exists:projects,id',
            'priority'    => 'sometimes|in:low,medium,high,urgent',
            'status'      => 'sometimes|in:todo,inprogress,review,done',
            'assignee_id' => 'sometimes|nullable|integer|exists:users,id',
            'due_date'    => 'sometimes|nullable|date',
            'date_debut'  => 'sometimes|nullable|date',
            'terminee'    => 'sometimes|boolean',
        ]);

        $data = $request->only([
            'title', 'description', 'project_id', 'priority',
            'status', 'due_date', 'date_debut', 'terminee'
        ]);

        // assignee_id → nom aussi
        if ($request->has('assignee_id')) {
            $data['assignee_id'] = $request->filled('assignee_id')
                ? (int) $request->input('assignee_id') : null;
            $assigneeUser = $data['assignee_id'] ? User::find($data['assignee_id']) : null;
            $data['assignee'] = $assigneeUser?->name ?? '';
        }

        // terminee → status done
        if (!empty($data['terminee'])) {
            $data['status'] = 'done';
        }

        // ✅ S'assurer que 'project' n'est jamais écrit
        unset($data['project']);

        $task->update($data);
        $task->refresh();

        return $this->success($this->formatTask($task), 'Tâche mise à jour');
    }

    // ─────────────────────────────────────────────────────
    //  MOVE — Kanban drag & drop
    // ─────────────────────────────────────────────────────
    public function move(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();

        $task = Task::find($id);
        if (!$task) return $this->notFound('Tâche introuvable');

        $request->validate([
            'status' => 'required|in:todo,inprogress,review,done',
        ]);

        $task->update([
            'status'   => $request->status,
            'terminee' => $request->status === 'done',
        ]);

        return $this->success($this->formatTask($task), 'Statut mis à jour');
    }

    // ─────────────────────────────────────────────────────
    //  DESTROY
    // ─────────────────────────────────────────────────────
    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();

        $task = Task::find($id);
        if (!$task) return $this->notFound('Tâche introuvable');

        $task->delete();
        return $this->success(null, 'Tâche supprimée');
    }

    // ─────────────────────────────────────────────────────
    //  STATS
    // ─────────────────────────────────────────────────────
    public function stats(): JsonResponse
    {
        $tasks = Task::all()->map(fn($t) => $this->formatTask($t));

        return $this->success([
            'total'      => $tasks->count(),
            'todo'       => $tasks->where('status', 'todo')->count(),
            'inprogress' => $tasks->where('status', 'inprogress')->count(),
            'review'     => $tasks->where('status', 'review')->count(),
            'done'       => $tasks->where('status', 'done')->count(),
            'urgent'     => $tasks->where('priority', 'urgent')->count(),
            'high'       => $tasks->where('priority', 'high')->count(),
            'medium'     => $tasks->where('priority', 'medium')->count(),
            'low'        => $tasks->where('priority', 'low')->count(),
        ]);
    }

    // ─────────────────────────────────────────────────────
    //  HELPER — Format tâche normalisée
    //  ✅ project = nom depuis Project model, pas la colonne VARCHAR
    // ─────────────────────────────────────────────────────
    private function formatTask(Task $task): array
    {
        $data = $task->toArray();

        // project_id toujours présent
        $data['project_id'] = $task->project_id ?? null;

        // ✅ project = nom du projet depuis la relation, pas la colonne VARCHAR(10)
        $project = $task->project_id ? Project::find($task->project_id) : null;
        $data['project'] = $project?->name ?? '';

        // assignee_id
        $data['assignee_id'] = $task->assignee_id ?? null;

        // status normalisé
        $statusMap = [
            'en_cours'   => 'inprogress',
            'en_retard'  => 'inprogress',
            'todo'       => 'todo',
            'inprogress' => 'inprogress',
            'review'     => 'review',
            'done'       => 'done',
            'terminee'   => 'done',
        ];
        $data['status'] = $statusMap[$task->status ?? 'todo'] ?? 'todo';
        $data['statut'] = $data['status'];

        // terminee sync
        $data['terminee'] = $data['status'] === 'done';

        // dates null si vide
        $data['due_date']   = $task->due_date   ?: null;
        $data['date_debut'] = $task->date_debut ?: null;

        return $data;
    }
}