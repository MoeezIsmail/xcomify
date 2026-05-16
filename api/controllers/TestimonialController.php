<?php
class TestimonialController {
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function getAll(): array {
        $stmt = $this->db->query('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC');
        return ['data' => $stmt->fetchAll()];
    }

    public function create(array $body): array {
        $name = trim($body['name'] ?? ''); $content = trim($body['content'] ?? '');
        if (!$name || !$content) { http_response_code(400); return ['error' => 'Name and content required']; }
        $stmt = $this->db->prepare('INSERT INTO testimonials (name, company, role, content, rating, platform, revenue, is_featured) VALUES (?,?,?,?,?,?,?,?)');
        $stmt->execute([$name, $body['company'] ?? '', $body['role'] ?? '', $content, (int)($body['rating'] ?? 5), $body['platform'] ?? '', $body['revenue'] ?? '', (int)($body['is_featured'] ?? 0)]);
        return ['id' => (int)$this->db->lastInsertId(), 'message' => 'Testimonial added'];
    }

    public function update(int $id, array $body): array {
        $fields = ['name','company','role','content','rating','platform','revenue','is_featured','is_active'];
        $sets = []; $params = [];
        foreach ($fields as $f) { if (array_key_exists($f, $body)) { $sets[] = "$f = ?"; $params[] = $body[$f]; } }
        if (empty($sets)) return ['error' => 'Nothing to update'];
        $params[] = $id;
        $this->db->prepare('UPDATE testimonials SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($params);
        return ['message' => 'Updated'];
    }

    public function delete(int $id): array {
        $this->db->prepare('DELETE FROM testimonials WHERE id = ?')->execute([$id]);
        return ['message' => 'Deleted'];
    }
}
