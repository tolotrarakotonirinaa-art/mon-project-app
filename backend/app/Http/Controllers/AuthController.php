<?php
namespace App\Http\Controllers;

use App\Mail\CompteValide;
use App\Mail\NouvelleInscription;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AuthController extends BaseController
{
    // ─────────────────────────────────────────────────────
    //  LOGIN
    // ─────────────────────────────────────────────────────
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->error('Email ou mot de passe incorrect', 401);
        }

        if (!$user->is_validated) {
            return $this->error(
                "Votre compte est en attente de validation par l'administrateur.",
                403
            );
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
        ], 'Connexion reussie');
    }

    // ─────────────────────────────────────────────────────
    //  REGISTER — Mandefa email ho an'ny admin
    // ─────────────────────────────────────────────────────
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => 'required|string|min:2|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'sometimes|in:dev,client',
        ]);

        if ($request->input('role') === 'admin') {
            return $this->error('Le role admin ne peut pas etre choisi lors de inscription.', 403);
        }

        $user = User::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'password'     => Hash::make($request->password),
            'role'         => $request->input('role', 'dev'),
            'is_validated' => false,
            'join_date'    => now()->toDateString(),
            'avatar'       => strtoupper(
                                implode('', array_map(
                                    fn($w) => $w[0],
                                    explode(' ', $request->name)
                                ))
                              ),
            'bio' => '',
        ]);

        // ← VAOVAO: Mandefa email ho an'ny admin rehetra
        try {
            $admins = User::where('role', 'admin')
                          ->where('is_validated', true)
                          ->get();

            foreach ($admins as $admin) {
                Mail::to($admin->email)
                    ->send(new NouvelleInscription($user, $admin));
            }
        } catch (\Exception $e) {
            Log::error('Erreur envoi email inscription: ' . $e->getMessage());
        }

        return $this->created([
            'user' => $this->formatUser($user),
        ], 'Compte cree. En attente de validation par administrateur.');
    }

    // ─────────────────────────────────────────────────────
    //  ME
    // ─────────────────────────────────────────────────────
    public function me(Request $request): JsonResponse
    {
        $authUser = $this->authUser($request);
        $user = User::find($authUser['id']);
        if (!$user) return $this->error('Utilisateur introuvable', 404);
        return $this->success($this->formatUser($user));
    }

    // ─────────────────────────────────────────────────────
    //  LOGOUT
    // ─────────────────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        return $this->success(null, 'Deconnexion reussie');
    }

    // ─────────────────────────────────────────────────────
    //  CHANGE PASSWORD
    // ─────────────────────────────────────────────────────
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
        return $this->success(null, 'Mot de passe mis a jour');
    }

    // ─────────────────────────────────────────────────────
    //  UPDATE PROFILE
    // ─────────────────────────────────────────────────────
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
        return $this->success($this->formatUser($user), 'Profil mis a jour');
    }

    // ─────────────────────────────────────────────────────
    //  ADMIN — Users miandry validation
    // ─────────────────────────────────────────────────────
    public function pendingUsers(Request $request): JsonResponse
    {
        $authUser = $this->authUser($request);

        if ($authUser['role'] !== 'admin') {
            return $this->error('Acces reserve a administrateur.', 403);
        }

        $users = User::where('is_validated', false)
                     ->where('role', '!=', 'admin')
                     ->orderBy('created_at', 'desc')
                     ->get()
                     ->map(fn($u) => $this->formatUser($u));

        return $this->success($users);
    }

    // ─────────────────────────────────────────────────────
    //  ADMIN — Valider user — Mandefa email ho an'ny user
    // ─────────────────────────────────────────────────────
    public function validateUser(Request $request, int $id): JsonResponse
    {
        $authUser = $this->authUser($request);

        if ($authUser['role'] !== 'admin') {
            return $this->error('Acces reserve a administrateur.', 403);
        }

        $user = User::find($id);
        if (!$user) {
            return $this->error('Utilisateur introuvable.', 404);
        }

        $user->update(['is_validated' => true]);

        // ← VAOVAO: Mandefa email ho an'ny user valide
        try {
            Mail::to($user->email)
                ->send(new CompteValide($user));
        } catch (\Exception $e) {
            Log::error('Erreur envoi email validation: ' . $e->getMessage());
        }

        return $this->success(
            $this->formatUser($user),
            'Utilisateur valide avec succes. Email envoye.'
        );
    }

    // ─────────────────────────────────────────────────────
    //  ADMIN — Rejeter user
    // ─────────────────────────────────────────────────────
    public function rejectUser(Request $request, int $id): JsonResponse
    {
        $authUser = $this->authUser($request);

        if ($authUser['role'] !== 'admin') {
            return $this->error('Acces reserve a administrateur.', 403);
        }

        $user = User::find($id);
        if (!$user) {
            return $this->error('Utilisateur introuvable.', 404);
        }

        $user->delete();

        return $this->success(null, 'Utilisateur rejete et supprime.');
    }

    // ─────────────────────────────────────────────────────
    //  FORMAT USER
    // ─────────────────────────────────────────────────────
    private function formatUser(User $user): array
    {
        return [
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'role'         => $user->role,
            'is_validated' => $user->is_validated,
            'avatar'       => $user->avatar ?? strtoupper(substr($user->name, 0, 2)),
            'bio'          => $user->bio ?? '',
            'join_date'    => $user->join_date,
        ];
    }
}