<?php
namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $q = Project::query();
        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('search')) $q->where('name', 'ilike', '%'.$request->search.'%');
        return $this->success($q->get());
    }

    public function show(int $id): JsonResponse
    {
        $p = Project::find($id);
        if (!$p) return $this->notFound('Projet introuvable');
        return $this->success($p);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden('Seuls Admin et Dev peuvent créer des projets');
        $request->validate([
            'name'        => 'required|string|min:2|max:120',
            'description' => 'sometimes|string|max:500',
            'status'      => 'sometimes|in:active,pending,completed',
            'end_date'    => 'sometimes|date',
            'color'       => 'sometimes|string',
            'tags'        => 'sometimes|array',
        ]);
        $user = $this->authUser($request);
        $p = Project::create([
            'name'        => $request->name,
            'description' => $request->input('description', ''),
            'status'      => $request->input('status', 'active'),
            'progress'    => 0,
            'start_date'  => now()->toDateString(),
            'end_date'    => $request->input('end_date'),
            'team'        => [],
            'color'       => $request->input('color', '#00c8ff'),
            'tags'        => $request->input('tags', []),
            'created_by'  => $user['id'],
        ]);
        return $this->created($p, 'Projet créé avec succès');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $p = Project::find($id);
        if (!$p) return $this->notFound('Projet introuvable');
        $p->update($request->only(['name','description','status','progress','end_date','color','tags','team']));
        return $this->success($p, 'Projet mis à jour');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden('Seul Admin peut supprimer des projets');
        $p = Project::find($id);
        if (!$p) return $this->notFound();
        $p->delete();
        return $this->success(null, 'Projet supprimé');
    }

    public function stats(int $id): JsonResponse
    {
        $p = Project::find($id);
        if (!$p) return $this->notFound();
        return $this->success(['project' => $p->name, 'progress' => $p->progress]);
    }
}
