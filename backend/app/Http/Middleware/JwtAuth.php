<?php
namespace App\Http\Middleware;

use App\Services\JwtService;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtAuth
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $token = $this->extractToken($request);

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token manquant. Veuillez vous connecter.',
            ], 401);
        }

        $payload = JwtService::verify($token);

        if (!$payload) {
            return response()->json([
                'success' => false,
                'message' => 'Token invalide ou expiré.',
            ], 401);
        }

        // Récupérer l'utilisateur depuis PostgreSQL
        $user = User::find((int) $payload['sub']);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur introuvable.',
            ], 401);
        }

        // Vérification des rôles
        if (!empty($roles) && !in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès refusé. Rôle requis : ' . implode(' ou ', $roles),
            ], 403);
        }

        // Injecter l'utilisateur dans la requête
        $userArray = [
            'id'     => $user->id,
            'name'   => $user->name,
            'email'  => $user->email,
            'role'   => $user->role,
            'avatar' => $user->avatar,
        ];

        $request->merge(['_auth_user' => $userArray]);
        $request->attributes->set('auth_user', $userArray);

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization', '');
        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        return $request->query('token');
    }
}
