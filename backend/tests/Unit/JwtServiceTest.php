<?php

namespace Tests\Unit;

use App\Services\JwtService;
use Tests\TestCase;

/**
 * Tests tena izy an'ny JwtService (fanamboarana sy fanamarinana token JWT).
 * Tsy misy HTTP na DB atsy — fitsapana Unit madio.
 */
class JwtServiceTest extends TestCase
{
    public function test_generates_a_token_with_three_parts(): void
    {
        $token = JwtService::generate(['sub' => 1, 'role' => 'dev']);

        $this->assertCount(3, explode('.', $token));
    }

    public function test_verifies_a_valid_token_and_returns_the_payload(): void
    {
        $token = JwtService::generate(['sub' => 42, 'email' => 'lucas@usvpa.mg', 'role' => 'dev']);

        $payload = JwtService::verify($token);

        $this->assertNotNull($payload);
        $this->assertSame(42, $payload['sub']);
        $this->assertSame('lucas@usvpa.mg', $payload['email']);
        $this->assertSame('dev', $payload['role']);
    }

    public function test_rejects_a_token_with_a_tampered_signature(): void
    {
        $token = JwtService::generate(['sub' => 1]);
        [$header, $body] = explode('.', $token);
        $tampered = "$header.$body.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

        $this->assertNull(JwtService::verify($tampered));
    }

    public function test_rejects_a_token_with_a_modified_payload(): void
    {
        $token = JwtService::generate(['sub' => 1, 'role' => 'dev']);
        [$header, $body, $sig] = explode('.', $token);

        // Manova ny payload nefa mitazona ny signature tranainy — tokony ho lavina.
        $forgedPayload = rtrim(strtr(base64_encode(json_encode(['sub' => 1, 'role' => 'admin'])), '+/', '-_'), '=');
        $forged = "$header.$forgedPayload.$sig";

        $this->assertNull(JwtService::verify($forged));
    }

    public function test_rejects_a_malformed_token(): void
    {
        $this->assertNull(JwtService::verify('ceci-nest-pas-un-jwt'));
        $this->assertNull(JwtService::verify('a.b'));
        $this->assertNull(JwtService::verify(''));
    }

    public function test_rejects_an_expired_token(): void
    {
        // Manorina token "misandratra" manokana, misy exp lasa tany aloha,
        // mitovy signature amin'izay hataon'ny JwtService::generate().
        $secret = 'devenviron4d-secret-key-tests'; // mitovy amin'ny JWT_SECRET ao phpunit.xml
        $header = rtrim(strtr(base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'])), '+/', '-_'), '=');
        $payload = rtrim(strtr(base64_encode(json_encode([
            'sub' => 1,
            'iat' => time() - 7200,
            'exp' => time() - 3600, // efa lany fotoana adiny 1 lasa
        ])), '+/', '-_'), '=');
        $sig = rtrim(strtr(base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true)), '+/', '-_'), '=');

        $expiredToken = "$header.$payload.$sig";

        $this->assertNull(JwtService::verify($expiredToken));
    }
}