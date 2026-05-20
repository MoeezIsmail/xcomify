<?php
class AdvertisementController {
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function getActive(): array {
        $stmt = $this->db->query("SELECT * FROM advertisements WHERE is_active = 1 AND (starts_at IS NULL OR starts_at <= CURRENT_TIMESTAMP) AND (ends_at IS NULL OR ends_at >= CURRENT_TIMESTAMP) ORDER BY created_at DESC LIMIT 1");
        return $stmt->fetch() ?: [];
    }

    public function getAll(): array {
        return ['data' => $this->db->query('SELECT * FROM advertisements ORDER BY created_at DESC')->fetchAll()];
    }

    public function create(array $b): array {
        $this->db->prepare('INSERT INTO advertisements (title,description,image_url,cta_text,cta_link,bg_color,badge_text,is_active,starts_at,ends_at) VALUES (?,?,?,?,?,?,?,?,?,?)')->execute([
            $b['title'] ?? '', $b['description'] ?? '', $b['image_url'] ?? '',
            $b['cta_text'] ?? '', $b['cta_link'] ?? '', $b['bg_color'] ?? '#00D4FF',
            $b['badge_text'] ?? '', (int)($b['is_active'] ?? 1),
            $b['starts_at'] ?: null, $b['ends_at'] ?: null
        ]);
        return ['id' => (int)$this->db->lastInsertId(), 'message' => 'Created'];
    }

    public function update(int $id, array $b): array {
        $this->db->prepare('UPDATE advertisements SET title=?,description=?,image_url=?,cta_text=?,cta_link=?,bg_color=?,badge_text=?,is_active=?,starts_at=?,ends_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')->execute([
            $b['title'] ?? '', $b['description'] ?? '', $b['image_url'] ?? '',
            $b['cta_text'] ?? '', $b['cta_link'] ?? '', $b['bg_color'] ?? '#00D4FF',
            $b['badge_text'] ?? '', (int)($b['is_active'] ?? 1),
            $b['starts_at'] ?: null, $b['ends_at'] ?: null, $id
        ]);
        return ['message' => 'Updated'];
    }

    public function delete(int $id): array {
        $this->db->prepare('DELETE FROM advertisements WHERE id = ?')->execute([$id]);
        return ['message' => 'Deleted'];
    }
}
