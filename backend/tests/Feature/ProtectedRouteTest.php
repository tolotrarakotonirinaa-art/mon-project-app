<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\JwtService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Fitsapana tena izy amin'ny middleware JwtAuth, amin'ny alalan'ny
 * route tena misy ao amin'ny API (miaro amin'ny jwt.auth).
 */
class ProtectedRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_rejects_request_without_token(): void
    {
        $this->getJson('/api/dashboard')
            ->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    public function test_environments_list_rejects_invalid_token(): void
    {
        $this->getJson('/api/environments', [
            'Authorization' => 'Bearer ceci-nest-pas-un-token-valide',
        ])->assertStatus(401);
    }

    public function test_environments_list_accepts_a_valid_token(): void
    {
        $user = User::create([
            'name'         => 'Dev Valide',
            'email'        => 'dev.valide@usvpa.mg',
            'password'     => bcrypt('motdepasse'),
            'role'         => 'dev',
            'is_validated' => true,
        ]);

        $token = JwtService::generate([
            'sub'   => $user->id,
            'email' => $user->email,
            'role'  => $user->role,
            'name'  => $user->name,
        ]);

        $this->getJson('/api/environments', [
            'Authorization' => "Bearer $token",
        ])->assertStatus(200)
          ->assertJson(['success' => true]);
    }

    public function test_admin_only_route_rejects_a_dev_role_token(): void
    {
        $user = User::create([
            'name'         => 'Simple Dev',
            'email'        => 'simple.dev@usvpa.mg',
            'password'     => bcrypt('motdepasse'),
            'role'         => 'dev',
            'is_validated' => true,
        ]);

        $token = JwtService::generate([
            'sub'   => $user->id,
            'email' => $user->email,
            'role'  => $user->role,
            'name'  => $user->name,
        ]);

        // DELETE /environments/{id} mila role admin (isAdmin ao EnvironmentController)
        $this->deleteJson('/api/environments/999', [], [
            'Authorization' => "Bearer $token",
        ])->assertStatus(403);
    }
}