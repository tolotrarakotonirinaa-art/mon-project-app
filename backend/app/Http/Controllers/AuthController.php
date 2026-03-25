<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends BaseController
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
            'role'     => 'sometimes|in:admin,dev,client',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->error('Email ou mot de passe incorrect', 401);
        }

        if ($request->filled('role')) {
            $user->role = $request->role;
        }

        $token = JwtService::generate([
            'sub'   => $user->id,
            'email' => $user->email,
            'role'  => $user->role,
            'name'  => $user->name,
        ]);

        return $this->success([
            'token' => $token,
            'user'  => $this->formatUser($user),
        ], 'Connexion réussie');
    }

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => 'required|string|min:2|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'sometimes|in:admin,dev,client',
        ]);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => $request->input('role', 'dev'),
            'join_date' => now()->toDateString(),
            'avatar'    => strtoupper(implode('', array_map(fn($w) => $w[0], explode(' ', $request->name)))),
            'bio'       => '',
        ]);

        $token = JwtService::generate([
            'sub'   => $user->id,
            'email' => $user->email,
            'role'  => $user->role,
            'name'  => $user->name,
        ]);

        return $this->created([
            'token' => $token,
            'user'  => $this->formatUser($user),
        ], 'Compte créé avec succès');
    }

    public function me(Request $request): JsonResponse
    {
        $authUser = $this->authUser($request);
        $user = User::find($authUser['id']);
        if (!$user) return $this->error('Utilisateur introuvable', 404);
        return $this->success($this->formatUser($user));
    }

    public function logout(Request $request): JsonResponse
    {
        return $this->success(null, 'Déconnexion réussie');
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6',
        ]);

        $authUser = $this->authUser($request);
        $user = User::find($authUser['id']);

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->error('Mot de passe actuel incorrect', 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);
        return $this->success(null, 'Mot de passe mis à jour');
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name'  => 'sometimes|string|min:2',
            'email' => 'sometimes|email',
            'bio'   => 'sometimes|string|max:500',
        ]);

        $authUser = $this->authUser($request);
        $user = User::find($authUser['id']);
        $user->update($request->only(['name', 'email', 'bio']));
        return $this->success($this->formatUser($user), 'Profil mis à jour');
    }

    private function formatUser(User $user): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'role'      => $user->role,
            'avatar'    => $user->avatar ?? strtoupper(substr($user->name, 0, 2)),
            'bio'       => $user->bio ?? '',
            'join_date' => $user->join_date,
        ];
    }
}
