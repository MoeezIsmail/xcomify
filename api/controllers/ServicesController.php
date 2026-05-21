<?php
class ServicesController {
    public function __construct() {}

    public function getAll(): array {
        $data = R::getAll('SELECT * FROM services ORDER BY sort_order ASC');
        return ['data' => $data];
    }

    public function create(array $body): array {
        $title = trim($body['title'] ?? '');
        if (!$title) { http_response_code(400); return ['error' => 'Title required']; }
        $slug = $body['slug'] ?? strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));

        $bean = R::dispense('services');
        $bean->title       = $title;
        $bean->slug        = $slug;
        $bean->icon        = $body['icon']        ?? '';
        $bean->short_desc  = $body['short_desc']  ?? '';
        $bean->description = $body['description'] ?? '';
        $bean->features    = $body['features']    ?? '';
        $bean->color       = $body['color']       ?? '#00D4FF';
        $id = R::store($bean);

        return ['id' => (int)$id, 'message' => 'Service created'];
    }

    public function update(int $id, array $body): array {
        $fields = ['title', 'icon', 'short_desc', 'description', 'features', 'color', 'sort_order', 'is_active'];
        $sets = []; $params = [];
        foreach ($fields as $f) { if (array_key_exists($f, $body)) { $sets[] = "$f = ?"; $params[] = $body[$f]; } }
        if (empty($sets)) { http_response_code(400); return ['error' => 'Nothing to update']; }
        $params[] = $id;
        R::exec('UPDATE services SET ' . implode(', ', $sets) . ' WHERE id = ?', $params);
        return ['message' => 'Updated'];
    }

    public function delete(int $id): array {
        R::exec('DELETE FROM services WHERE id = ?', [$id]);
        return ['message' => 'Deleted'];
    }
}
