<?php
namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends BaseController
{
    // ─────────────────────────────────────────────────────
    //  INDEX — Liste projets filtrée selon role
    // ─────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $authUser = $this->authUser($request);
        $user     = User::find($authUser['id']);

        if (!$user) {
            return $this->error('Utilisateur introuvable', 404);
        }

        $query = Project::accessibles($user);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name',        'ilike', '%'.$request->search.'%')
                  ->orWhere('description','ilike', '%'.$request->search.'%')
                  ->orWhere('responsable','ilike', '%'.$request->search.'%');
            });
        }

        $projects = $query->orderBy('created_at', 'desc')->get();

        $projects = $projects->map(fn($p) => $this->withAutoStatus($p));

        return $this->success($projects);
    }

    // ─────────────────────────────────────────────────────
    //  SHOW
    // ─────────────────────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $p = Project::find($id);
        if (!$p) return $this->notFound('Projet introuvable');
        return $this->success($this->withAutoStatus($p));
    }

    // ─────────────────────────────────────────────────────
    //  STORE — Créer projet
    // ─────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        if (!$this->isDev($request)) {
            return $this->forbidden('Seuls Admin et Dev peuvent créer des projets');
        }

        $request->validate([
            'name'            => 'required|string|min:2|max:120',
            'description'     => 'sometimes|nullable|string',
            'objectifs'       => 'sometimes|nullable|string',
            'technologies'    => 'sometimes|nullable',
            'responsable'     => 'sometimes|nullable|string|max:120',
            'responsable_id'  => 'sometimes|nullable|integer|exists:users,id',
            'status'          => 'sometimes|in:active,pending,completed',
            'color'           => 'sometimes|nullable|string',
            'start_date'      => 'sometimes|nullable|date',
            'end_date'        => 'sometimes|nullable|date|after_or_equal:start_date',
            'tags'            => 'sometimes|nullable|array',
            'progress'        => 'sometimes|integer|min:0|max:100',
            'progress_manuel' => 'sometimes|boolean',
            'team_ids'        => 'sometimes|nullable|array',
            'team_ids.*'      => 'integer|exists:users,id',
        ]);

        $user = $this->authUser($request);

        // Technologies — accepte array ou string
        $techs = $request->input('technologies', []);
        if (is_array($techs)) {
            $techs = implode(',', array_filter($techs, fn($t) => trim($t) !== ''));
        }

        // team_ids — creator toujours inclus
        $teamIds = $request->input('team_ids', []);
        $teamIds = array_map('intval', array_filter($teamIds));
        if (!in_array((int)$user['id'], $teamIds)) {
            $teamIds[] = (int)$user['id'];
        }
        $teamIds = array_values(array_unique($teamIds));

        // responsable — toujours string, jamais null
        $responsable = $request->input('responsable') ?: '';
        if ($responsable === '' && $request->filled('responsable_id')) {
            $respUser    = User::find($request->input('responsable_id'));
            $responsable = $respUser?->name ?? '';
        }

        $p = Project::create([
            'name'            => trim($request->name),
            'description'     => $request->input('description', '') ?? '',
            'objectifs'       => $request->input('objectifs', '') ?? '',
            'technologies'    => $techs,
            'responsable'     => $responsable,
            'status'          => $request->input('status', 'active'),
            'progress'        => (int) $request->input('progress', 0),
            'progress_manuel' => (bool) $request->input('progress_manuel', false),
            'start_date'      => $request->input('start_date') ?: now()->toDateString(),
            'end_date'        => $request->input('end_date') ?: null,
            'color'           => $request->input('color', '#00c8ff'),
            'team'            => $teamIds,
            'tags'            => $request->input('tags', []) ?? [],
            'created_by'      => (int) $user['id'],
        ]);

        return $this->created($this->withAutoStatus($p), 'Projet créé avec succès');
    }

    // ─────────────────────────────────────────────────────
    //  UPDATE — Modifier projet
    // ─────────────────────────────────────────────────────
    public function update(Request $request, int $id): JsonResponse
    {
        if (!$this->isDev($request)) {
            return $this->forbidden();
        }

        $p = Project::find($id);
        if (!$p) return $this->notFound('Projet introuvable');

        $user = User::find($this->authUser($request)['id']);
        if (!$p->isAccessibleBy($user)) {
            return $this->forbidden("Vous n'avez pas accès à ce projet");
        }

        $request->validate([
            'name'            => 'sometimes|required|string|min:2|max:120',
            'description'     => 'sometimes|nullable|string',
            'objectifs'       => 'sometimes|nullable|string',
            'technologies'    => 'sometimes|nullable',
            'responsable'     => 'sometimes|nullable|string|max:120',
            'responsable_id'  => 'sometimes|nullable|integer|exists:users,id',
            'status'          => 'sometimes|in:active,pending,completed',
            'color'           => 'sometimes|nullable|string',
            'start_date'      => 'sometimes|nullable|date',
            'end_date'        => 'sometimes|nullable|date',
            'tags'            => 'sometimes|nullable|array',
            'progress'        => 'sometimes|integer|min:0|max:100',
            'progress_manuel' => 'sometimes|boolean',
            'team_ids'        => 'sometimes|nullable|array',
            'team_ids.*'      => 'integer|exists:users,id',
        ]);

        // Technologies — normaliser
        if ($request->has('technologies')) {
            $techs = $request->input('technologies');
            if (is_array($techs)) {
                $techs = implode(',', array_filter($techs, fn($t) => trim($t) !== ''));
            }
            $request->merge(['technologies' => $techs]);
        }

        // team_ids → team
        if ($request->has('team_ids')) {
            $teamIds = array_map('intval', array_filter($request->input('team_ids', [])));
            $teamIds = array_values(array_unique($teamIds));
            $request->merge(['team' => $teamIds]);
        }

        // responsable depuis responsable_id si besoin
        if ($request->has('responsable_id') && !$request->filled('responsable')) {
            $respUser = User::find($request->input('responsable_id'));
            $request->merge(['responsable' => $respUser?->name ?? '']);
        }

        // responsable jamais null
        if ($request->has('responsable') && is_null($request->input('responsable'))) {
            $request->merge(['responsable' => '']);
        }

        // progress manuel auto
        if ($request->filled('progress') && !$request->has('progress_manuel')) {
            $request->merge(['progress_manuel' => true]);
        }

        $p->update($request->only([
            'name', 'description', 'objectifs', 'technologies',
            'responsable', 'status', 'progress', 'progress_manuel',
            'start_date', 'end_date', 'color', 'tags', 'team'
        ]));

        return $this->success($this->withAutoStatus($p), 'Projet mis à jour');
    }

    // ─────────────────────────────────────────────────────
    //  RECALCULATE PROGRESS
    // ─────────────────────────────────────────────────────
    public function recalculateProgress(Request $request, int $id): JsonResponse
    {
        $p = Project::find($id);
        if (!$p) return $this->notFound('Projet introuvable');

        $total = Task::where('project_id', $id)->count();
        $done  = Task::where('project_id', $id)
                     ->where('status', 'done')
                     ->count();

        $progress = $total === 0 ? 0 : (int) round(($done / $total) * 100);

        $p->update([
            'progress'        => $progress,
            'progress_manuel' => false,
        ]);

        return $this->success([
            'progress' => $progress,
            'total'    => $total,
            'done'     => $done,
        ], 'Progression recalculée automatiquement');
    }

    // ─────────────────────────────────────────────────────
    //  DESTROY
    // ─────────────────────────────────────────────────────
    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return $this->forbidden('Seul Admin peut supprimer des projets');
        }

        $p = Project::find($id);
        if (!$p) return $this->notFound();
        $p->delete();
        return $this->success(null, 'Projet supprimé');
    }

    // ─────────────────────────────────────────────────────
    //  STATS
    // ─────────────────────────────────────────────────────
    public function stats(int $id): JsonResponse
    {
        $p = Project::find($id);
        if (!$p) return $this->notFound();

        $tasks = Task::where('project_id', $id)->get();
        $done  = $tasks->where('status', 'done')->count();

        return $this->success([
            'project'  => $p->name,
            'progress' => $p->progress,
            'tasks'    => [
                'total'    => $tasks->count(),
                'done'     => $done,
                'restante' => $tasks->count() - $done,
                'overdue'  => $tasks->where('status', 'overdue')->count(),
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────
    //  HELPER — Statut automatique selon dates
    // ─────────────────────────────────────────────────────
    private function withAutoStatus(Project $p): array
    {
        $data  = $p->toArray();
        $now   = now();
        $start = $p->start_date;
        $end   = $p->end_date;

        if ($p->status === 'completed') {
            $data['auto_status'] = 'completed';
        } elseif ($end && $now->greaterThan($end) && $p->progress < 100) {
            $data['auto_status'] = 'overdue';
        } elseif ($start && $now->lessThan($start)) {
            $data['auto_status'] = 'pending';
        } else {
            $data['auto_status'] = 'active';
        }

        // Technologies toujours en array
        if (isset($data['technologies'])) {
            if (is_string($data['technologies'])) {
                $data['technologies'] = array_values(array_filter(
                    explode(',', $data['technologies']),
                    fn($t) => trim($t) !== ''
                ));
            } elseif (!is_array($data['technologies'])) {
                $data['technologies'] = [];
            }
        } else {
            $data['technologies'] = [];
        }

        // team_ids depuis team
        if (isset($data['team']) && is_array($data['team'])) {
            $data['team_ids'] = $data['team'];
        } else {
            $data['team_ids'] = [];
        }

        return $data;
    }
}