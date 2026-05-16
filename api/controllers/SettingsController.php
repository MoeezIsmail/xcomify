<?php
class SettingsController {
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function get(): array {
        $stmt = $this->db->query('SELECT key, value FROM settings');
        $rows = $stmt->fetchAll();
        $result = [];
        foreach ($rows as $row) { $result[$row['key']] = $row['value']; }
        return $result;
    }

    public function update(array $body): array {
        $stmt = $this->db->prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP');
        foreach ($body as $key => $value) {
            $stmt->execute([$key, is_bool($value) ? ($value ? '1' : '0') : (string)$value]);
        }
        return ['message' => 'Settings saved'];
    }
}
