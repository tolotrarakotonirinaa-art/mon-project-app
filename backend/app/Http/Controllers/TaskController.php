<?php
namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Task::query();
        
        // Filtré amin'ny statut automatique
        if ($request->filled('status')) {
            // Mila filtrer amin'ny accessor — atao amin'ny PHP satria virtual ny statut
            $tasks = $query->get();
            $tasks = $tasks->filter(function($task) use ($request) {
                return $task->statut === $request->status;
            });
            return $this->success($tasks->values());
        }
        
        // Filtrés hafa
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('project')) {
            $query->where('project', $request->project);
        }
        if ($request->filled('assignee')) {
            $query->where('assignee', $request->assignee);
        }
        
        $tasks = $query->get();
        
        // Manampy ny statut automatique ho an'ny réponse
        $tasks = $tasks->map(function($task) {
            return [
                'id'          => $task->id,
                'title'       => $task->title,
                'description' => $task->description,
                'project'     => $task->project,
                'statut'      => $task->statut,  // ← automatique
                'status'      => $task->status,  // ← saha taloha (tsy ampiasaina)
                'priority'    => $task->priority,
                'assignee'    => $task->assignee,
                'due_date'    => $task->due_date,
                'terminee'    => $task->terminee,
                'created_by'  => $task->created_by,
                'created_at'  => $task->created_at,
                'updated_at'  => $task->updated_at,
            ];
        });
        
        return $this->success($tasks);
    }

    public function show(int $id): JsonResponse
    {
        $task = Task::find($id);
        if (!$task) return $this->notFound('Tâche introuvable');
        
        $data = $task->toArray();
        $data['statut'] = $task->statut;  // ← automatique
        
        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        
        $request->validate([
            'title'    => 'required|string|min:2|max:200',
            'project'  => 'required|string',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'due_date' => 'sometimes|date',
        ]);
        
        $user = $this->authUser($request);
        
        $task = Task::create([
            'title'       => $request->title,
            'project'     => $request->project,
            'status'      => 'todo',  // default, fa ovain'ny accessor
            'priority'    => $request->input('priority', 'medium'),
            'assignee'    => $request->input('assignee', ''),
            'due_date'    => $request->input('due_date'),
            'description' => $request->input('description', ''),
            'terminee'    => false,  // ← vaovao
            'created_by'  => $user['id'],
        ]);
        
        return $this->created($task, 'Tâche créée');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        
        $task = Task::find($id);
        if (!$task) return $this->notFound('Tâche introuvable');
        
        // ← VAOVAO: Tsy avela manova ny 'status' intsony (automatique)
        // 'terminee' ihany no azo ovaina mba hanamarika vita
        $allowedFields = ['title', 'priority', 'assignee', 'due_date', 'description', 'terminee'];
        $task->update($request->only($allowedFields));
        
        // Raha nisy fanovana ny due_date na terminee, dia hovain'ny accessor ny status
        $task->refresh();
        
        return $this->success($task, 'Tâche mise à jour');
    }

    // ← VAOVAO: Esorina ny fonction move() — tsy tokony hisy manuel
  
    // Raha tianao avela ho an'ny Admin sy Dev ihany fa tsy Client:
    // Atao ao amin'ny BaseController ny vérification
    
    public function marquerTerminee(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        
        $task = Task::find($id);
        if (!$task) return $this->notFound('Tâche introuvable');
        
        $task->update(['terminee' => true]);
        
        return $this->success($task, 'Tâche marquée comme terminée');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        
        $task = Task::find($id);
        if (!$task) return $this->notFound('Tâche introuvable');
        
        $task->delete();
        return $this->success(null, 'Tâche supprimée');
    }

    public function stats(): JsonResponse
    {
        $tasks = Task::all();
        
        // Mampiasa ny statut automatique
        $todo = $tasks->filter(fn($t) => $t->statut === 'todo')->count();
        $enCours = $tasks->filter(fn($t) => $t->statut === 'en_cours')->count();
        $enRetard = $tasks->filter(fn($t) => $t->statut === 'en_retard')->count();
        $done = $tasks->filter(fn($t) => $t->statut === 'done')->count();
        
        return $this->success([
            'total'      => $tasks->count(),
            'todo'       => $todo,
            'en_cours'   => $enCours,
            'en_retard'  => $enRetard,
            'done'       => $done,
            'high'       => Task::where('priority', 'high')->count(),
            'medium'     => Task::where('priority', 'medium')->count(),
            'low'        => Task::where('priority', 'low')->count(),
        ]);
    }
}