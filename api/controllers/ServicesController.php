<?php
class ServicesController {
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function getAll(): array {
        $stmt = $this->db->query('SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC');
        return ['data' => $stmt->fetchAll()];
    }

    public function create(array $body): array {
        $title = trim($body['title'] ?? '');
        if (!$title) { http_response_code(400); return ['error' => 'Title required']; }
        $slug = $body['slug'] ?? strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
        $stmt = $this->db->prepare('INSERT INTO services (title, slug, icon, short_desc, description, features, color) VALUES (?,?,?,?,?,?,?)');
        $stmt->execute([$title, $slug, $body['icon'] ?? '', $body['short_desc'] ?? '', $body['description'] ?? '', $body['features'] ?? '', $body['color'] ?? '#00D4FF']);
        return ['id' => (int)$this->db->lastInsertId(), 'message' => 'Service created'];
    }

    public function update(int $id, array $body): array {
        $fields = ['title','icon','short_desc','description','features','color','sort_order','is_active'];
        $sets = []; $params = [];
        foreach ($fields as $f) { if (array_key_exists($f, $body)) { $sets[] = "$f = ?"; $params[] = $body[$f]; } }
        if (empty($sets)) { http_response_code(400); return ['error' => 'Nothing to update']; }
        $params[] = $id;
        $this->db->prepare('UPDATE services SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($params);
        return ['message' => 'Updated'];
    }

    public function delete(int $id): array {
        $this->db->prepare('DELETE FROM services WHERE id = ?')->execute([$id]);
        return ['message' => 'Deleted'];
    }
}
