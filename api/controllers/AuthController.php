<?php
class AuthController {
    private AuthMiddleware $auth;

    public function __construct() {
        $this->auth = new AuthMiddleware();
    }

    public function login(array $body): array {
        $email    = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            return ['error' => 'Email and password are required'];
        }

        $user = R::getRow('SELECT * FROM users WHERE email = ?', [$email]);

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
