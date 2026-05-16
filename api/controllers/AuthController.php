<?php
class AuthController {
    private PDO $db;
    private AuthMiddleware $auth;

    public function __construct(PDO $db) {
        $this->db   = $db;
        $this->auth = new AuthMiddleware($db);
    }

    public function login(array $body): array {
        $email    = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            return ['error' => 'Email and password are required'];
        }

        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            return ['error' => 'Invalid credentials'];
        }

        $token = $this->auth->generateToken(['sub' => $user['id'], 'role' => $user['role']]);

        return [
            'token' => $token,
            'user'  => [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role'],
            ],
        ];
    }

    public function me(array $user): array {
        return ['user' => $user];
    }
}
