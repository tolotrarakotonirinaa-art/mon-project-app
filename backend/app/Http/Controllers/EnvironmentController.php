<?php
namespace App\Http\Controllers;

use App\Models\Environment;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnvironmentController extends BaseController
{
    // ─── LIST ────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        return $this->success(Environment::all());
    }

    // ─── SHOW ────────────────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $e = Environment::find($id);
        if (!$e) return $this->notFound('Environnement introuvable');
        return $this->success($e);
    }

    // ─── CREATE ──────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();

        $validated = $request->validate([
            'name'    => 'required|string|min:2|max:80',
            'type'    => 'required|in:dev,staging,production',
            'url'     => 'nullable|url|max:255',
            'version' => ['nullable', 'regex:/^\d+\.\d+(\.\d+)?(-[\w.]+)?$/'],
        ]);

        $user = $this->authUser($request);

        $e = Environment::create([
            'name'        => $validated['name'],
            'type'        => $validated['type'],
            'status'      => 'stopped',
            'url'         => $validated['url'] ?? '',
            'version'     => $validated['version'] ?? '1.0.0',
            'last_deploy' => null,
            'cpu'         => 0,
            'memory'      => 0,
            'created_by'  => $user['id'],
        ]);

        return $this->created($e);
    }

    // ─── UPDATE ──────────────────────────────────────────────
    public function update(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();

        $e = Environment::find($id);
        if (!$e) return $this->notFound('Environnement introuvable');

        $validated = $request->validate([
            'name'    => 'sometimes|string|min:2|max:80',
            'url'     => 'sometimes|nullable|url|max:255',
            'version' => ['sometimes', 'nullable', 'regex:/^\d+\.\d+(\.\d+)?(-[\w.]+)?$/'],
            'status'  => 'sometimes|in:running,stopped,deploying,unknown',
            'cpu'     => 'sometimes|integer|min:0|max:100',
            'memory'  => 'sometimes|integer|min:0|max:100',
        ]);

        $e->update($validated);

        return $this->success($e);
    }

    // ─── DELETE ──────────────────────────────────────────────
    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden();

        $e = Environment::find($id);
        if (!$e) return $this->notFound('Environnement introuvable');

        $e->delete();

        return $this->success(null, 'Environnement supprimé');
    }

    // ─── DEPLOY (DB only — tsy misy SSH) ────────────────────
    // Manavao status sy last_deploy ao amin'ny DB fotsiny.
    public function deploy(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) return $this->forbidden();

        $e = Environment::find($id);
        if (!$e) return $this->notFound('Environnement introuvable');

        $version = $request->input('version', $e->version);

        $e->update([
            'status'      => 'running',
            'last_deploy' => now(),
            'version'     => $version,
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

        return $this->success([
            'id'          => $e->id,
            'status'      => $e->status,
            'last_deploy' => $e->last_deploy,
            'version'     => $e->version,
        ], "Déploiement de {$e->name} enregistré");
    }

    // ─── METRICS (DB only — tsy misy rand()) ────────────────
    // Averina ny valeurs réels ao amin'ny DB.
    // Admin no manavao cpu/memory via PUT /environments/{id}.
    public function metrics(int $id): JsonResponse
    {
        $e = Environment::find($id);
        if (!$e) return $this->notFound('Environnement introuvable');

        return $this->success([
            'cpu'    => $e->cpu    ?? 0,
            'memory' => $e->memory ?? 0,
            'status' => $e->status ?? 'unknown',
        ]);
    }
}
