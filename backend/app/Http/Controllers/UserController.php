<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden('Seul Admin peut voir la liste des utilisateurs');
        return $this->success(User::all()->map(fn($u) => $this->safe($u)));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $authUser = $this->authUser($request);
        if (!$this->isAdmin($request) && $authUser['id'] !== $id) return $this->forbidden();
        $user = User::find($id);
        if (!$user) return $this->notFound('Utilisateur introuvable');
        return $this->success($this->safe($user));
    }

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
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => $request->role,
            'join_date' => now()->toDateString(),
            'avatar'    => strtoupper(implode('', array_map(fn($w) => $w[0], explode(' ', $request->name)))),
            'bio'       => $request->input('bio', ''),
        ]);
        return $this->created($this->safe($user));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $authUser = $this->authUser($request);
        if (!$this->isAdmin($request) && $authUser['id'] !== $id) return $this->forbidden();
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

    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$this->isAdmin($request)) return $this->forbidden();
        $authUser = $this->authUser($request);
        if ($authUser['id'] === $id) return $this->error('Vous ne pouvez pas vous supprimer vous-même');
        $user = User::find($id);
        if (!$user) return $this->notFound();
        $user->delete();
        return $this->success(null, 'Utilisateur supprimé');
    }

    private function safe(User $user): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'role'      => $user->role,
            'avatar'    => $user->avatar,
            'bio'       => $user->bio,
            'join_date' => $user->join_date,
        ];
    }
}
