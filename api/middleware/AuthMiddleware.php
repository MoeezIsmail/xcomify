<?php
class AuthMiddleware {
    private string $secret;

    public function __construct() {
        $this->secret = getenv('JWT_SECRET') ?: 'xcomify_jwt_secret_2024_very_long_and_secure';
    }

    public function requireAuth(): array {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/^Bearer (.+)$/', $header, $m)) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: no token']);
            exit;
        }

        $user = $this->verifyToken($m[1]);
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: invalid token']);
            exit;
        }
        return $user;
    }

    public function optionalAuth(): ?array {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/^Bearer (.+)$/', $header, $m)) return null;
        return $this->verifyToken($m[1]);
    }

    public function generateToken(array $payload): string {
        $header  = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload['exp'] = time() + 86400 * 7; // 7 days
        $payload_enc = base64url_encode(json_encode($payload));
        $sig = hash_hmac('sha256', "$header.$payload_enc", $this->secret, true);
        return "$header.$payload_enc." . base64url_encode($sig);
    }

    public function verifyToken(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $sig] = $parts;
        $expected = base64url_encode(
            hash_hmac('sha256', "$header.$payload", $this->secret, true)
        );

        if (!hash_equals($expected, $sig)) return null;

        $data = json_decode(base64url_decode($payload), true);
        if (!$data || (isset($data['exp']) && $data['exp'] < time())) return null;

        $row = R::getRow('SELECT id, name, email, role FROM users WHERE id = ?', [$data['sub']]);
        return $row ?: null;
    }
}

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 4 - strlen($data) % 4));
}
