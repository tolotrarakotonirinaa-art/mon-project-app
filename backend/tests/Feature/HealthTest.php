<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Fitsapana tena izy amin'ny route GET /api/health — mandefa tena
 * request HTTP mankany amin'ny application Laravel.
 */
class HealthTest extends TestCase
{
    public function test_health_endpoint_is_reachable_and_returns_ok(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'app'    => 'DevEnviron 4D API',
            ])
            ->assertJsonStructure(['status', 'app', 'version', 'time']);
    }
}