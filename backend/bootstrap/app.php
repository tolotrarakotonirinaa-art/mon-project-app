<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // CORS sur toutes les routes API
        $middleware->prepend(\App\Http\Middleware\Cors::class);

        // Alias middleware
        $middleware->alias([
            'jwt.auth'       => \App\Http\Middleware\JwtAuth::class,
            'jwt.auth.admin' => fn($req, $next) => (new \App\Http\Middleware\JwtAuth)->handle($req, $next, 'admin'),
            'jwt.auth.dev'   => fn($req, $next) => (new \App\Http\Middleware\JwtAuth)->handle($req, $next, 'admin', 'dev'),
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Retourner du JSON pour toutes les erreurs HTTP
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Route ou ressource introuvable',
                ], 404);
            }
        });

        $exceptions->render(function (\Exception $e, Request $request) {
            if ($request->is('api/*') && app()->environment('production')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur serveur interne',
                ], 500);
            }
        });
    })->create();
