<?php
namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $q = Task::query();
        if ($request->filled('status'))   $q->where('status', $request->status);
        if ($request->filled('priority')) $q->where('priority', $request->priority);
        if ($request->filled('project'))  $q->where('project', $request->project);
        if ($request->filled('assignee')) $q->where('assignee', $request->assignee);
        return $this->success($q->get());
    }

    public function show(int $id): JsonResponse
    {
        $t = Task::find($id);
        if (!$t) return $this->notFound('Tâche introuvable');
        return $this->success($t);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $request->validate([
            'title'   => 'required|string|min:2|max:200',
            'project' => 'required|string',
            'status'  => 'sometimes|in:todo,inprogress,done',
            'priority'=> 'sometimes|in:low,medium,high,urgent',
        ]);
        $user = $this->authUser($request);
        $t = Task::create([
            'title'       => $request->title,
            'project'     => $request->project,
            'status'      => $request->input('status', 'todo'),
            'priority'    => $request->input('priority', 'medium'),
            'assignee'    => $request->input('assignee', ''),
            'due_date'    => $request->input('due_date'),
            'description' => $request->input('description', ''),
            'created_by'  => $user['id'],
        ]);
        return $this->created($t, 'Tâche créée');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $t = Task::find($id);
        if (!$t) return $this->notFound('Tâche introuvable');
        $t->update($request->only(['title','status','priority','assignee','due_date','description']));
        return $this->success($t, 'Tâche mise à jour');
    }

    public function move(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $request->validate(['status' => 'required|in:todo,inprogress,done']);
        $t = Task::find($id);
        if (!$t) return $this->notFound('Tâche introuvable');
        $t->update(['status' => $request->status]);
        return $this->success($t, 'Tâche déplacée');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $t = Task::find($id);
        if (!$t) return $this->notFound('Tâche introuvable');
        $t->delete();
        return $this->success(null, 'Tâche supprimée');
    }

    public function stats(): JsonResponse
    {
        return $this->success([
            'total'      => Task::count(),
            'todo'       => Task::where('status','todo')->count(),
            'inprogress' => Task::where('status','inprogress')->count(),
            'done'       => Task::where('status','done')->count(),
            'high'       => Task::where('priority','high')->count(),
            'medium'     => Task::where('priority','medium')->count(),
            'low'        => Task::where('priority','low')->count(),
        ]);
    }
}
