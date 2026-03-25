<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PipelineController;
use App\Http\Controllers\RepositoryController;
use App\Http\Controllers\EnvironmentController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| DevEnviron 4D — API Routes
|--------------------------------------------------------------------------
| Toutes les routes sont préfixées par /api (configuré dans bootstrap/app.php)
|
| Phase 1 : Données mockées (MockDataStore)
| Phase 2 : PostgreSQL (même routes, mêmes controllers)
|--------------------------------------------------------------------------
*/

// ── Health check ─────────────────────────────────────────
Route::get('/health', fn() => response()->json([
    'status'  => 'ok',
    'app'     => 'DevEnviron 4D API',
    'version' => '1.0.0',
    'phase'   => 'Phase 1 — Mock Data',
    'time'    => now()->toISOString(),
]));

// ── Auth (public) ─────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// ── Routes protégées (JWT requis) ─────────────────────────
Route::middleware('jwt.auth')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('/me',           [AuthController::class, 'me']);
        Route::post('/logout',      [AuthController::class, 'logout']);
        Route::put('/password',     [AuthController::class, 'changePassword']);
        Route::put('/profile',      [AuthController::class, 'updateProfile']);
    });

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Projects
    Route::prefix('projects')->group(function () {
        Route::get('/',             [ProjectController::class, 'index']);
        Route::post('/',            [ProjectController::class, 'store']);
        Route::get('/{id}',         [ProjectController::class, 'show']);
        Route::put('/{id}',         [ProjectController::class, 'update']);
        Route::delete('/{id}',      [ProjectController::class, 'destroy']);
        Route::get('/{id}/stats',   [ProjectController::class, 'stats']);
    });

    // Tasks
    Route::prefix('tasks')->group(function () {
        Route::get('/stats',        [TaskController::class, 'stats']);
        Route::get('/',             [TaskController::class, 'index']);
        Route::post('/',            [TaskController::class, 'store']);
        Route::get('/{id}',         [TaskController::class, 'show']);
        Route::put('/{id}',         [TaskController::class, 'update']);
        Route::patch('/{id}/move',  [TaskController::class, 'move']);
        Route::delete('/{id}',      [TaskController::class, 'destroy']);
    });

    // Users (admin uniquement pour liste + create + delete)
    Route::prefix('users')->group(function () {
        Route::get('/',             [UserController::class, 'index']);
        Route::post('/',            [UserController::class, 'store']);
        Route::get('/{id}',         [UserController::class, 'show']);
        Route::put('/{id}',         [UserController::class, 'update']);
        Route::delete('/{id}',      [UserController::class, 'destroy']);
    });

    // Repositories
    Route::prefix('repositories')->group(function () {
        Route::get('/',             [RepositoryController::class, 'index']);
        Route::post('/',            [RepositoryController::class, 'store']);
        Route::get('/{id}',         [RepositoryController::class, 'show']);
        Route::put('/{id}',         [RepositoryController::class, 'update']);
        Route::delete('/{id}',      [RepositoryController::class, 'destroy']);
        Route::post('/{id}/star',   [RepositoryController::class, 'star']);
    });

    // Environments
    Route::prefix('environments')->group(function () {
        Route::get('/',             [EnvironmentController::class, 'index']);
        Route::post('/',            [EnvironmentController::class, 'store']);
        Route::get('/{id}',         [EnvironmentController::class, 'show']);
        Route::put('/{id}',         [EnvironmentController::class, 'update']);
        Route::delete('/{id}',      [EnvironmentController::class, 'destroy']);
        Route::post('/{id}/deploy', [EnvironmentController::class, 'deploy']);
        Route::get('/{id}/metrics', [EnvironmentController::class, 'metrics']);
    });

    // Pipeline
    Route::prefix('pipeline')->group(function () {
        Route::get('/status',       [PipelineController::class, 'status']);
        Route::get('/logs',         [PipelineController::class, 'logs']);
        Route::post('/run',         [PipelineController::class, 'run']);
        Route::post('/stop',        [PipelineController::class, 'stop']);
        Route::patch('/stage',      [PipelineController::class, 'updateStage']);
        Route::delete('/logs',      [PipelineController::class, 'clearLogs']);
    });

    // Chat
    Route::prefix('chat')->group(function () {
        Route::get('/messages',     [ChatController::class, 'index']);
        Route::post('/messages',    [ChatController::class, 'store']);
        Route::delete('/messages',  [ChatController::class, 'clear']);
        Route::delete('/messages/{id}', [ChatController::class, 'destroy']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/',                  [NotificationController::class, 'index']);
        Route::patch('/read-all',        [NotificationController::class, 'markAllRead']);
        Route::patch('/{id}/read',       [NotificationController::class, 'markRead']);
        Route::delete('/{id}',           [NotificationController::class, 'destroy']);
    });

    // Statistics
    Route::get('/statistics', [StatisticsController::class, 'index']);

});

// ── 404 fallback ──────────────────────────────────────────
Route::fallback(fn() => response()->json([
    'success' => false,
    'message' => 'Route introuvable. Consultez la documentation API.',
], 404));
