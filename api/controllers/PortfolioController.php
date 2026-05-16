<?php
class PortfolioController {
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function getAll(): array {
        $stmt = $this->db->query('SELECT * FROM portfolio WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC');
        return ['data' => $stmt->fetchAll()];
    }

    public function create(array $body): array {
        $title = trim($body['title'] ?? '');
        if (!$title) { http_response_code(400); return ['error' => 'Title required']; }
        $stmt = $this->db->prepare('INSERT INTO portfolio (title, category, challenge, solution, result, metrics, tags, color, is_featured) VALUES (?,?,?,?,?,?,?,?,?)');
        $stmt->execute([$title, $body['category'] ?? '', $body['challenge'] ?? '', $body['solution'] ?? '', $body['result'] ?? '', $body['metrics'] ?? '', $body['tags'] ?? '', $body['color'] ?? '#00D4FF', (int)($body['is_featured'] ?? 0)]);
        return ['id' => (int)$this->db->lastInsertId(), 'message' => 'Portfolio item created'];
    }

    public function update(int $id, array $body): array {
        $fields = ['title','category','challenge','solution','result','metrics','tags','color','is_featured','is_active'];
        $sets = []; $params = [];
        foreach ($fields as $f) { if (array_key_exists($f, $body)) { $sets[] = "$f = ?"; $params[] = $body[$f]; } }
        if (empty($sets)) return ['error' => 'Nothing to update'];
        $params[] = $id;
        $this->db->prepare('UPDATE portfolio SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($params);
        return ['message' => 'Updated'];
    }

    public function delete(int $id): array {
        $this->db->prepare('DELETE FROM portfolio WHERE id = ?')->execute([$id]);
        return ['message' => 'Deleted'];
    }
}
