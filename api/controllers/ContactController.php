<?php
class ContactController {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function create(array $body): array {
        $name    = trim($body['name'] ?? '');
        $email   = trim($body['email'] ?? '');
        $message = trim($body['message'] ?? '');

        if (!$name || !$email || !$message) {
            http_response_code(400);
            return ['error' => 'Name, email, and message are required'];
        }

        $stmt = $this->db->prepare('
            INSERT INTO contacts (name, email, phone, company, platform, message)
            VALUES (?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([$name, $email, $body['phone'] ?? null, $body['company'] ?? null, $body['platform'] ?? null, $message]);

        return ['message' => 'Message sent successfully'];
    }

    public function getAll(): array {
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $limit  = min(50, (int)($_GET['limit'] ?? 20));
        $offset = ($page - 1) * $limit;

        $stmt = $this->db->prepare('SELECT * FROM contacts ORDER BY created_at DESC LIMIT ? OFFSET ?');
        $stmt->execute([$limit, $offset]);
        $data = $stmt->fetchAll();

        $total = (int)$this->db->query('SELECT COUNT(*) FROM contacts')->fetchColumn();
        return compact('data', 'total', 'page', 'limit');
    }

    public function delete(int $id): array {
        $this->db->prepare('DELETE FROM contacts WHERE id = ?')->execute([$id]);
        return ['message' => 'Deleted'];
    }

    public function markRead(int $id): array {
        $this->db->prepare('UPDATE contacts SET is_read = 1 WHERE id = ?')->execute([$id]);
        return ['message' => 'Marked as read'];
    }
}
