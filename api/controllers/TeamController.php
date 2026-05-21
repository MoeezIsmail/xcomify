<?php
class TeamController {
    public function __construct() {}

    public function getAll(): array {
        $data = R::getAll('SELECT * FROM team WHERE is_active = 1 ORDER BY sort_order ASC');
        return ['data' => $data];
    }

    public function create(array $body): array {
        $name = trim($body['name'] ?? '');
        if (!$name) { http_response_code(400); return ['error' => 'Name required']; }

        $bean = R::dispense('team');
        $bean->name     = $name;
        $bean->role     = $body['role']     ?? '';
        $bean->bio      = $body['bio']      ?? '';
        $bean->linkedin = $body['linkedin'] ?? '';
        $bean->twitter  = $body['twitter']  ?? '';
        $id = R::store($bean);

        return ['id' => (int)$id, 'message' => 'Team member added'];
    }

    public function update(int $id, array $body): array {
        $fields = ['name', 'role', 'bio', 'linkedin', 'twitter', 'sort_order', 'is_active'];
        $sets = []; $params = [];
        foreach ($fields as $f) { if (array_key_exists($f, $body)) { $sets[] = "$f = ?"; $params[] = $body[$f]; } }
        if (empty($sets)) return ['error' => 'Nothing to update'];
        $params[] = $id;
        R::exec('UPDATE team SET ' . implode(', ', $sets) . ' WHERE id = ?', $params);
        return ['message' => 'Updated'];
    }

    public function delete(int $id): array {
        R::exec('DELETE FROM team WHERE id = ?', [$id]);
        return ['message' => 'Deleted'];
    }
}
