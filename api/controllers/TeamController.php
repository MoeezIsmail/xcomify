<?php
class TeamController {
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function getAll(): array {
        $stmt = $this->db->query('SELECT * FROM team WHERE is_active = 1 ORDER BY sort_order ASC');
        return ['data' => $stmt->fetchAll()];
    }

    public function create(array $body): array {
        $name = trim($body['name'] ?? '');
        if (!$name) { http_response_code(400); return ['error' => 'Name required']; }
        $stmt = $this->db->prepare('INSERT INTO team (name, role, bio, linkedin, twitter) VALUES (?,?,?,?,?)');
        $stmt->execute([$name, $body['role'] ?? '', $body['bio'] ?? '', $body['linkedin'] ?? '', $body['twitter'] ?? '']);
        return ['id' => (int)$this->db->lastInsertId(), 'message' => 'Team member added'];
    }

    public function update(int $id, array $body): array {
        $fields = ['name','role','bio','linkedin','twitter','sort_order','is_active'];
        $sets = []; $params = [];
        foreach ($fields as $f) { if (array_key_exists($f, $body)) { $sets[] = "$f = ?"; $params[] = $body[$f]; } }
        if (empty($sets)) return ['error' => 'Nothing to update'];
        $params[] = $id;
        $this->db->prepare('UPDATE team SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($params);
        return ['message' => 'Updated'];
    }

    public function delete(int $id): array {
        $this->db->prepare('DELETE FROM team WHERE id = ?')->execute([$id]);
        return ['message' => 'Deleted'];
    }
}
