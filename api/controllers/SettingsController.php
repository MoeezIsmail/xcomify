<?php
class SettingsController {
    private const SENSITIVE_KEYS = ['huggingface_token', 'access_token', 'smtp_pass'];

    public function __construct() {}

    public function get(): array {
        $rows   = R::getAll('SELECT * FROM settings');
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
        $bean = R::findOne('settings', '`key` = ?', [$key]) ?? R::dispense('settings');
        $bean->key   = $key;
        $bean->value = $value;
        R::store($bean);
    }
}
