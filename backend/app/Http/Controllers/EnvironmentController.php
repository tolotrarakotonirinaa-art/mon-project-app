<?php
namespace App\Http\Controllers;

use App\Models\Environment;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnvironmentController extends BaseController
{
    public function index(): JsonResponse
    {
        return $this->success(Environment::all());
    }

    public function show(int $id): JsonResponse
    {
        $e = Environment::find($id);
        if (!$e) return $this->notFound('Environnement introuvable');
        return $this->success($e);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $request->validate([
            'name' => 'required|string|min:2|max:80',
            'type' => 'required|in:dev,staging,production',
        ]);
        $user = $this->authUser($request);
        $e = Environment::create([
            'name'        => $request->name,
            'type'        => $request->type,
            'status'      => 'stopped',
            'url'         => $request->input('url', ''),
            'version'     => $request->input('version', '1.0.0'),
            'last_deploy' => now()->toDateString(),
            'cpu'         => 0,
            'memory'      => 0,
            'created_by'  => $user['id'],
        ]);
        return $this->created($e);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $e = Environment::find($id);
        if (!$e) return $this->notFound();
        $e->update($request->only(['name','url','version','status']));
        return $this->success($e);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden();
        $e = Environment::find($id);
        if (!$e) return $this->notFound();
        $e->delete();
        return $this->success(null, 'Environnement supprimé');
    }

    public function deploy(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();
        $e = Environment::find($id);
        if (!$e) return $this->notFound();
        $e->update([
            'status'      => 'running',
            'last_deploy' => now()->toDateString(),
            'version'     => $request->input('version', $e->version),
        ]);
        $user = $this->authUser($request);
        Activity::create([
            'user'    => $user['name'],
            'action'  => "a déployé {$e->name} v{$e->version}",
            'icon'    => 'rocket',
            'color'   => '#ff6b35',
            'time'    => "À l'instant",
            'user_id' => $user['id'],
        ]);
        return $this->success($e, "Déploiement de {$e->name} réussi");
    }

    public function metrics(int $id): JsonResponse
    {
        $e = Environment::find($id);
        if (!$e) return $this->notFound();
        return $this->success([
            'cpu'     => $e->cpu ?? rand(10,90),
            'memory'  => $e->memory ?? rand(20,85),
            'disk'    => rand(30,70),
            'uptime'  => '3 jours 14h',
        ]);
    }
}
