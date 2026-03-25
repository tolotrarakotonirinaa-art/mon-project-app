<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class BaseController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function success(mixed $data = null, string $message = 'OK', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $code);
    }

    protected function created(mixed $data, string $message = 'Créé avec succès'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    protected function error(string $message, int $code = 400, mixed $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];
        if ($errors) $response['errors'] = $errors;
        return response()->json($response, $code);
    }

    protected function notFound(string $message = 'Ressource introuvable'): JsonResponse
    {
        return $this->error($message, 404);
    }

    protected function forbidden(string $message = 'Accès refusé'): JsonResponse
    {
        return $this->error($message, 403);
    }

    protected function authUser(Request $request): array
    {
        return $request->attributes->get('auth_user', []);
    }

    protected function isAdmin(Request $request): bool
    {
        return ($this->authUser($request)['role'] ?? '') === 'admin';
    }

    protected function isDev(Request $request): bool
    {
        return in_array($this->authUser($request)['role'] ?? '', ['admin', 'dev']);
    }
}
