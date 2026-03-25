<?php

namespace App\Services;

/**
 * JwtService — JWT maison pour Phase 1 (sans DB)
 * Phase 2 : remplacé par tymon/jwt-auth + PostgreSQL
 */
class JwtService
{
    private static string $secret;
    private static int $ttl = 1440; // minutes

    private static function secret(): string
    {
        if (!isset(self::$secret)) {
            self::$secret = env('JWT_SECRET', 'devenviron4d-secret-key-change-in-production');
        }
        return self::$secret;
    }

    public static function generate(array $payload): string
    {
        $header  = self::base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = array_merge($payload, [
            'iat' => time(),
            'exp' => time() + (self::$ttl * 60),
            'jti' => bin2hex(random_bytes(8)),
        ]);
        $body    = self::base64url(json_encode($payload));
        $sig     = self::base64url(hash_hmac('sha256', "$header.$body", self::secret(), true));
        return "$header.$body.$sig";
    }

    public static function verify(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $body, $sig] = $parts;
        $expected = self::base64url(hash_hmac('sha256', "$header.$body", self::secret(), true));

        if (!hash_equals($expected, $sig)) return null;

        $payload = json_decode(self::base64urldecode($body), true);
        if (!$payload) return null;
        if (isset($payload['exp']) && $payload['exp'] < time()) return null;

        return $payload;
    }

    private static function base64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64urldecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }
}
