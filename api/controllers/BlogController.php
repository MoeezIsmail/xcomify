<?php
class BlogController {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getAll(): array {
        $status = $_GET['status'] ?? 'published';
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $limit  = min(50, (int)($_GET['limit'] ?? 10));
        $offset = ($page - 1) * $limit;

        $where  = $status === 'all' ? '1=1' : 'status = ?';
        $params = $status === 'all' ? [$limit, $offset] : [$status, $limit, $offset];

        $stmt = $this->db->prepare("SELECT * FROM blogs WHERE $where ORDER BY created_at DESC LIMIT ? OFFSET ?");
        $stmt->execute($params);
        $data = $stmt->fetchAll();

        if ($status === 'all') {
            $total = (int)$this->db->query('SELECT COUNT(*) FROM blogs')->fetchColumn();
        } else {
            $cs = $this->db->prepare('SELECT COUNT(*) FROM blogs WHERE status = ?');
            $cs->execute([$status]);
            $total = (int)$cs->fetchColumn();
        }

        return compact('data', 'total', 'page', 'limit');
    }

    public function getBySlug(string $slug): array {
        $stmt = $this->db->prepare('SELECT * FROM blogs WHERE slug = ? AND status = ?');
        $stmt->execute([$slug, 'published']);
        $blog = $stmt->fetch();
        if (!$blog) { http_response_code(404); return ['error' => 'Not found']; }
        // Increment views
        $this->db->prepare('UPDATE blogs SET views = views + 1 WHERE id = ?')->execute([$blog['id']]);
        return $blog;
    }

    public function create(array $body): array {
        $title = trim($body['title'] ?? '');
        if (!$title) { http_response_code(400); return ['error' => 'Title is required']; }

        $slug = $body['slug'] ?? $this->makeSlug($title);
        $stmt = $this->db->prepare('
            INSERT INTO blogs (title, slug, excerpt, content, category, author, tags, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([$title, $slug, $body['excerpt'] ?? '', $body['content'] ?? '', $body['category'] ?? '', $body['author'] ?? 'Admin', $body['tags'] ?? '', $body['status'] ?? 'draft']);

        return ['id' => (int)$this->db->lastInsertId(), 'message' => 'Blog post created'];
    }

    public function update(int $id, array $body): array {
        $allowed = ['title', 'slug', 'excerpt', 'content', 'category', 'author', 'tags', 'status'];
        $sets = []; $params = [];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $body)) { $sets[] = "$f = ?"; $params[] = $body[$f]; }
        }
        if (empty($sets)) { http_response_code(400); return ['error' => 'Nothing to update']; }
        $params[] = $id;
        $this->db->prepare('UPDATE blogs SET ' . implode(', ', $sets) . ', updated_at = CURRENT_TIMESTAMP WHERE id = ?')->execute($params);
        return ['message' => 'Updated'];
    }

    public function delete(int $id): array {
        $this->db->prepare('DELETE FROM blogs WHERE id = ?')->execute([$id]);
        return ['message' => 'Deleted'];
    }

    private function makeSlug(string $text): string {
        return strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $text), '-'));
    }
}
