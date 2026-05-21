<?php
class ContactController {
    public function __construct() {}

    public function create(array $body): array {
        $name    = trim($body['name'] ?? '');
        $email   = trim($body['email'] ?? '');
        $message = trim($body['message'] ?? '');

        if (!$name || !$email || !$message) {
            http_response_code(400);
            return ['error' => 'Name, email, and message are required'];
        }

        $bean = R::dispense('contacts');
        $bean->name     = $name;
        $bean->email    = $email;
        $bean->phone    = $body['phone'] ?? null;
        $bean->company  = $body['company'] ?? null;
        $bean->platform = $body['platform'] ?? null;
        $bean->message  = $message;
        R::store($bean);

        return ['message' => 'Message sent successfully'];
    }

    public function getAll(): array {
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $limit  = min(50, (int)($_GET['limit'] ?? 20));
        $offset = ($page - 1) * $limit;

        $data  = R::getAll('SELECT * FROM contacts ORDER BY created_at DESC LIMIT ? OFFSET ?', [$limit, $offset]);
        $total = (int) R::getCell('SELECT COUNT(*) FROM contacts');
        return compact('data', 'total', 'page', 'limit');
    }

    public function delete(int $id): array {
        R::exec('DELETE FROM contacts WHERE id = ?', [$id]);
        return ['message' => 'Deleted'];
    }

    public function markRead(int $id): array {
        R::exec('UPDATE contacts SET is_read = 1 WHERE id = ?', [$id]);
        return ['message' => 'Marked as read'];
    }
}
