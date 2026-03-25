<?php
namespace App\Http\Controllers;

use App\Models\Repository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RepositoryController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $q = Repository::query();
        if ($request->filled('visibility')) $q->where('visibility', $request->visibility);
        if ($request->filled('search'))     $q->where('name', 'ilike', '%'.$request->search.'%');
        return $this->success($q->get());
    }

    public function show(int $id): JsonResponse
    {
        $r = Repository::find($id);
        if (!$r) return $this->notFound('Dépôt introuvable');
        return $this->success($r);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $request->validate([
            'name'       => 'required|string|min:2|max:100',
            'visibility' => 'sometimes|in:public,private',
        ]);
        $user = $this->authUser($request);
        $r = Repository::create([
            'name'        => $request->name,
            'description' => $request->input('description', ''),
            'visibility'  => $request->input('visibility', 'private'),
            'lang'        => $request->input('lang', 'JavaScript'),
            'url'         => $request->input('url', ''),
            'stars'       => 0,
            'forks'       => 0,
            'branches'    => 1,
            'created_by'  => $user['id'],
        ]);
        return $this->created($r);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $r = Repository::find($id);
        if (!$r) return $this->notFound();
        $r->update($request->only(['description','visibility','lang']));
        return $this->success($r);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden();
        $r = Repository::find($id);
        if (!$r) return $this->notFound();
        $r->delete();
        return $this->success(null, 'Dépôt supprimé');
    }

    public function star(int $id): JsonResponse
    {
        $r = Repository::find($id);
        if (!$r) return $this->notFound();
        $r->increment('stars');
        return $this->success($r, 'Star ajouté');
    }
}
