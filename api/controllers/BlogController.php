<?php
class BlogController {
    public function __construct() {}

    public function getAll(): array {
        $status = $_GET['status'] ?? 'published';
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $limit  = min(50, (int)($_GET['limit'] ?? 10));
        $offset = ($page - 1) * $limit;

        if ($status === 'all') {
            $data  = R::getAll('SELECT * FROM blogs ORDER BY created_at DESC LIMIT ? OFFSET ?', [$limit, $offset]);
            $total = (int) R::getCell('SELECT COUNT(*) FROM blogs');
        } else {
            $data  = R::getAll('SELECT * FROM blogs WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [$status, $limit, $offset]);
            $total = (int) R::getCell('SELECT COUNT(*) FROM blogs WHERE status = ?', [$status]);
        }

        return compact('data', 'total', 'page', 'limit');
    }

    public function getBySlug(string $slug): array {
        $blog = R::getRow('SELECT * FROM blogs WHERE slug = ? AND status = ?', [$slug, 'published']);
        if (!$blog) { http_response_code(404); return ['error' => 'Not found']; }
        // Increment views
        R::exec('UPDATE blogs SET views = views + 1 WHERE id = ?', [$blog['id']]);
        return $blog;
    }

    public function create(array $body): array {
        $title = trim($body['title'] ?? '');
        if (!$title) { http_response_code(400); return ['error' => 'Title is required']; }

        $slug = $body['slug'] ?? $this->makeSlug($title);

        $bean = R::dispense('blogs');
        $bean->title    = $title;
        $bean->slug     = $slug;
        $bean->excerpt  = $body['excerpt']  ?? '';
        $bean->content  = $body['content']  ?? '';
        $bean->category = $body['category'] ?? '';
        $bean->author   = $body['author']   ?? 'Admin';
        $bean->tags     = $body['tags']     ?? '';
        $bean->status   = $body['status']   ?? 'draft';
        $id = R::store($bean);

        return ['id' => (int)$id, 'message' => 'Blog post created'];
    }

    public function update(int $id, array $body): array {
        $allowed = ['title', 'slug', 'excerpt', 'content', 'category', 'author', 'tags', 'status'];
        $sets = []; $params = [];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $body)) { $sets[] = "$f = ?"; $params[] = $body[$f]; }
        }
        if (empty($sets)) { http_response_code(400); return ['error' => 'Nothing to update']; }
        $params[] = $id;
        R::exec('UPDATE blogs SET ' . implode(', ', $sets) . ', updated_at = CURRENT_TIMESTAMP WHERE id = ?', $params);
        return ['message' => 'Updated'];
    }

    public function delete(int $id): array {
        R::exec('DELETE FROM blogs WHERE id = ?', [$id]);
        return ['message' => 'Deleted'];
    }

    private function makeSlug(string $text): string {
        return strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $text), '-'));
    }
}
