<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Fitsapana tena izy amin'ny POST /api/auth/login.
 * Mampiasa RefreshDatabase → base sqlite mihidina anaty memory,
 * migré vaovao isaky ny fitsapana, ka TSY mikasika mihitsy ny
 * database pgsql "devenviron" tena an'ny dev/production.
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_requires_a_valid_email_format(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'pas-un-email',
            'password' => 'motdepasse',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_fails_with_unknown_email(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'inconnu@usvpa.mg',
            'password' => 'motdepasse',
        ]);

        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::create([
            'name'         => 'Lucas Test',
            'email'        => 'lucas.test@usvpa.mg',
            'password'     => Hash::make('bonmotdepasse'),
            'role'         => 'dev',
            'is_validated' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'lucas.test@usvpa.mg',
            'password' => 'mauvaismotdepasse',
        ]);

        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    public function test_login_fails_when_account_is_not_yet_validated(): void
    {
        User::create([
            'name'         => 'Nouveau Dev',
            'email'        => 'nouveau@usvpa.mg',
            'password'     => Hash::make('motdepasse'),
            'role'         => 'dev',
            'is_validated' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'nouveau@usvpa.mg',
            'password' => 'motdepasse',
        ]);

        $response->assertStatus(403);
    }

    public function test_login_succeeds_with_correct_credentials_and_returns_a_token(): void
    {
        User::create([
            'name'         => 'Lucas Rakotonirina',
            'email'        => 'lucas.ok@usvpa.mg',
            'password'     => Hash::make('bonmotdepasse'),
            'role'         => 'dev',
            'is_validated' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'lucas.ok@usvpa.mg',
            'password' => 'bonmotdepasse',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['data' => ['token', 'user' => ['id', 'email', 'role']]]);
    }
}