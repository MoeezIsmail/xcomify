<?php
class SettingsController {
    private PDO $db;

    private const SENSITIVE_KEYS = ['huggingface_token'];

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function get(): array {
        $stmt = $this->db->query('SELECT * FROM settings');
        $rows = $stmt->fetchAll();
        $result = [];
        foreach ($rows as $row) {
            $result[$row['key']] = $row['value'];
        }
        return $result;
    }

    public function getPublic(): array {
        $all = $this->get();
        foreach (self::SENSITIVE_KEYS as $k) {
            unset($all[$k]);
        }
        return $all;
    }

    public function update(array $body): array {
        foreach ($body as $key => $value) {
            $val = is_bool($value) ? ($value ? '1' : '0') : (string)$value;
            // Try MySQL upsert first
            try {
                $this->db->prepare(
                    'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?'
                )->execute([$key, $val, $val]);
            } catch (\Exception $e) {
                // SQLite fallback
                try {
                    $this->db->prepare(
                        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
                    )->execute([$key, $val]);
                } catch (\Exception $e2) {
                    $s = $this->db->prepare('SELECT id FROM settings WHERE key = ?');
                    $s->execute([$key]);
                    if ($s->fetch()) {
                        $this->db->prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?')->execute([$val, $key]);
                    } else {
                        $this->db->prepare('INSERT INTO settings (key, value) VALUES (?, ?)')->execute([$key, $val]);
                    }
                }
            }
        }
        return ['message' => 'Settings saved'];
    }
}
