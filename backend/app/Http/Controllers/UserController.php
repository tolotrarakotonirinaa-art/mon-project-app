<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends BaseController
{
    // ─────────────────────────────────────────────────────
    //  INDEX — Admin seulement
    // ─────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return $this->forbidden('Seul Admin peut voir la liste complète des utilisateurs');
        }
        return $this->success(User::all()->map(fn($u) => $this->safe($u)));
    }

    // ─────────────────────────────────────────────────────
    //  ASSIGNABLES — Users validés pour assignation équipe
    //  ← VAOVAO: Admin sy Dev afaka mahita
    // ─────────────────────────────────────────────────────
    public function assignables(Request $request): JsonResponse
    {
        // Admin sy Dev afaka mahita users validated
        $users = User::where('is_validated', true)
                     ->orderBy('name')
                     ->get()
                     ->map(fn($u) => [
                         'id'     => $u->id,
                         'name'   => $u->name,
                         'email'  => $u->email,
                         'role'   => $u->role,
                         'avatar' => $u->avatar ?? strtoupper(substr($u->name, 0, 2)),
                     ]);

        return $this->success($users);
    }

    // ─────────────────────────────────────────────────────
    //  SHOW
    // ─────────────────────────────────────────────────────
    public function show(Request $request, int $id): JsonResponse
    {
        $authUser = $this->authUser($request);
        if (!$this->isAdmin($request) && $authUser['id'] !== $id) {
            return $this->forbidden();
        }
        $user = User::find($id);
        if (!$user) return $this->notFound('Utilisateur introuvable');
        return $this->success($this->safe($user));
    }

    // ─────────────────────────────────────────────────────
    //  STORE — Admin crée un user directement
    // ─────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden();

        $request->validate([
            'name'     => 'required|string|min:2',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:admin,dev,client',
        ]);

        $user = User::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'password'     => Hash::make($request->password),
            'role'         => $request->role,
            'is_validated' => true, // Admin crée directement → validé
            'join_date'    => now()->toDateString(),
            'avatar'       => strtoupper(implode('', array_map(
                fn($w) => $w[0],
                explode(' ', $request->name)
            ))),
            'bio' => $request->input('bio', ''),
        ]);

        return $this->created($this->safe($user));
    }

    // ─────────────────────────────────────────────────────
    //  UPDATE
    // ─────────────────────────────────────────────────────
    public function update(Request $request, int $id): JsonResponse
    {
        $authUser = $this->authUser($request);
        if (!$this->isAdmin($request) && $authUser['id'] !== $id) {
            return $this->forbidden();
        }

        $user = User::find($id);
        if (!$user) return $this->notFound();

        $request->validate([
            'name'  => 'sometimes|string|min:2',
            'email' => 'sometimes|email',
            'role'  => 'sometimes|in:admin,dev,client',
            'bio'   => 'sometimes|string|max:500',
        ]);

        $allowed = ['name', 'email', 'bio'];
        if ($this->isAdmin($request)) $allowed[] = 'role';

        $user->update($request->only($allowed));
        return $this->success($this->safe($user));
    }

    // ─────────────────────────────────────────────────────
    //  DESTROY
    // ─────────────────────────────────────────────────────
    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden();

        $authUser = $this->authUser($request);
        if ($authUser['id'] === $id) {
            return $this->error('Vous ne pouvez pas vous supprimer vous-même');
        }

        $user = User::find($id);
        if (!$user) return $this->notFound();
        $user->delete();
        return $this->success(null, 'Utilisateur supprimé');
    }

    // ─────────────────────────────────────────────────────
    //  HELPER
    // ─────────────────────────────────────────────────────
    private function safe(User $user): array
    {
        return [
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'role'         => $user->role,
            'is_validated' => $user->is_validated,
            'avatar'       => $user->avatar ?? strtoupper(substr($user->name, 0, 2)),
            'bio'          => $user->bio,
            'join_date'    => $user->join_date,
        ];
    }
}