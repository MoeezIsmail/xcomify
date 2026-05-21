<?php
class SettingsController {
    private PDO $db;

    private const SENSITIVE_KEYS = ['huggingface_token', 'access_token'];

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
            $this->upsertSetting($key, $val);
        }
        return ['message' => 'Settings saved'];
    }

    private function upsertSetting(string $key, string $value): void {
        $driver = $this->db->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'mysql') {
            $this->db->prepare('INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?')
                ->execute([$key, $value, $value]);
        } else {
            $this->db->prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
                ->execute([$key, $value]);
        }
    }
}
