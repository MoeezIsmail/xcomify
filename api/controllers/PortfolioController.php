<?php
class PortfolioController {
    public function __construct() {}

    public function getAll(): array {
        $data = R::getAll('SELECT * FROM portfolio WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC');
        return ['data' => $data];
    }

    public function create(array $body): array {
        $title = trim($body['title'] ?? '');
        if (!$title) { http_response_code(400); return ['error' => 'Title required']; }

        $bean = R::dispense('portfolio');
        $bean->title       = $title;
        $bean->category    = $body['category']    ?? '';
        $bean->challenge   = $body['challenge']   ?? '';
        $bean->solution    = $body['solution']    ?? '';
        $bean->result      = $body['result']      ?? '';
        $bean->metrics     = $body['metrics']     ?? '';
        $bean->tags        = $body['tags']        ?? '';
        $bean->color       = $body['color']       ?? '#00D4FF';
        $bean->is_featured = (int)($body['is_featured'] ?? 0);
        $id = R::store($bean);

        return ['id' => (int)$id, 'message' => 'Portfolio item created'];
    }

    public function update(int $id, array $body): array {
        $fields = ['title', 'category', 'challenge', 'solution', 'result', 'metrics', 'tags', 'color', 'is_featured', 'is_active'];
        $sets = []; $params = [];
        foreach ($fields as $f) { if (array_key_exists($f, $body)) { $sets[] = "$f = ?"; $params[] = $body[$f]; } }
        if (empty($sets)) return ['error' => 'Nothing to update'];
        $params[] = $id;
        R::exec('UPDATE portfolio SET ' . implode(', ', $sets) . ' WHERE id = ?', $params);
        return ['message' => 'Updated'];
    }

    public function delete(int $id): array {
        R::exec('DELETE FROM portfolio WHERE id = ?', [$id]);
        return ['message' => 'Deleted'];
    }
}
