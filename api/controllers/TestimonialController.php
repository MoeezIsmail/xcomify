<?php
class TestimonialController {
    public function __construct() {}

    public function getAll(): array {
        $data = R::getAll('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC');
        return ['data' => $data];
    }

    public function create(array $body): array {
        $name    = trim($body['name'] ?? '');
        $content = trim($body['content'] ?? '');
        if (!$name || !$content) { http_response_code(400); return ['error' => 'Name and content required']; }

        $bean = R::dispense('testimonials');
        $bean->name        = $name;
        $bean->company     = $body['company']     ?? '';
        $bean->role        = $body['role']        ?? '';
        $bean->content     = $content;
        $bean->rating      = (int)($body['rating']      ?? 5);
        $bean->platform    = $body['platform']    ?? '';
        $bean->revenue     = $body['revenue']     ?? '';
        $bean->is_featured = (int)($body['is_featured'] ?? 0);
        $id = R::store($bean);

        return ['id' => (int)$id, 'message' => 'Testimonial added'];
    }

    public function update(int $id, array $body): array {
        $fields = ['name', 'company', 'role', 'content', 'rating', 'platform', 'revenue', 'is_featured', 'is_active'];
        $sets = []; $params = [];
        foreach ($fields as $f) { if (array_key_exists($f, $body)) { $sets[] = "$f = ?"; $params[] = $body[$f]; } }
        if (empty($sets)) return ['error' => 'Nothing to update'];
        $params[] = $id;
        R::exec('UPDATE testimonials SET ' . implode(', ', $sets) . ' WHERE id = ?', $params);
        return ['message' => 'Updated'];
    }

    public function delete(int $id): array {
        R::exec('DELETE FROM testimonials WHERE id = ?', [$id]);
        return ['message' => 'Deleted'];
    }
}
