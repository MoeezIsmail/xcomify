<?php
class NotificationController {
    public function __construct() {}

    private function formatTimestamp(?string $value): ?string {
        if (!$value) return null;
        try {
            return (new DateTimeImmutable($value, new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM);
        } catch (Exception $e) {
            return $value;
        }
    }

    private function preview(?string $value, int $width): string {
        $text = $value ?? '';
        if (function_exists('mb_strimwidth')) {
            return mb_strimwidth($text, 0, $width, '...');
        }
        return strlen($text) > $width ? substr($text, 0, max(0, $width - 3)) . '...' : $text;
    }

    public function getAll(): array {
        $lastRead = R::getCell("SELECT value FROM settings WHERE `key` = 'notifications_last_read'") ?: '2000-01-01 00:00:00';

        $contacts     = R::getAll("SELECT id, name, email, message, created_at FROM contacts WHERE is_read = 0 ORDER BY created_at DESC LIMIT 15");
        $applications = R::getAll("SELECT id, full_name, email, created_at FROM applications WHERE status = 'pending' ORDER BY created_at DESC LIMIT 15");

        $all = [];
        foreach ($contacts as $c) {
            $all[] = [
                'id'         => 'c' . $c['id'],
                'type'       => 'contact',
                'ref_id'     => (int)$c['id'],
                'title'      => 'New Inquiry',
                'body'       => ($c['name'] ?? 'Someone') . ' sent a message',
                'preview'    => $this->preview($c['message'] ?? '', 70),
                'is_new'     => $c['created_at'] > $lastRead,
                'created_at' => $c['created_at'],
                'created_at_iso' => $this->formatTimestamp($c['created_at']),
            ];
        }
        foreach ($applications as $a) {
            $all[] = [
                'id'         => 'a' . $a['id'],
                'type'       => 'application',
                'ref_id'     => (int)$a['id'],
                'title'      => 'New Application',
                'body'       => ($a['full_name'] ?? 'Someone') . ' submitted an application',
                'preview'    => $a['email'] ?? '',
                'is_new'     => $a['created_at'] > $lastRead,
                'created_at' => $a['created_at'],
                'created_at_iso' => $this->formatTimestamp($a['created_at']),
            ];
        }

        usort($all, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));

        return [
            'notifications' => array_slice($all, 0, 20),
            'new_count'     => count(array_filter($all, fn($n) => $n['is_new'])),
        ];
    }

    public function getLog(): array {
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $limit  = 30;
        $offset = ($page - 1) * $limit;

        $lastRead = R::getCell("SELECT value FROM settings WHERE `key` = 'notifications_last_read'") ?: '2000-01-01 00:00:00';

        $contacts     = R::getAll("SELECT id, name, email, message, is_read, created_at FROM contacts ORDER BY created_at DESC");
        $applications = R::getAll("SELECT id, full_name, email, status, created_at FROM applications ORDER BY created_at DESC");

        $all = [];
        foreach ($contacts as $c) {
            $all[] = [
                'id'         => 'c' . $c['id'],
                'type'       => 'contact',
                'ref_id'     => (int)$c['id'],
                'title'      => 'Inquiry',
                'body'       => ($c['name'] ?? 'Someone') . ' sent a message',
                'preview'    => $this->preview($c['message'] ?? '', 80),
                'is_new'     => !$c['is_read'] && $c['created_at'] > $lastRead,
                'is_read'    => (bool)$c['is_read'],
                'created_at' => $c['created_at'],
                'created_at_iso' => $this->formatTimestamp($c['created_at']),
            ];
        }
        foreach ($applications as $a) {
            $all[] = [
                'id'         => 'a' . $a['id'],
                'type'       => 'application',
                'ref_id'     => (int)$a['id'],
                'title'      => 'Application',
                'body'       => ($a['full_name'] ?? 'Someone') . ' submitted an application',
                'preview'    => $a['email'] ?? '',
                'is_new'     => $a['created_at'] > $lastRead,
                'is_read'    => $a['status'] !== 'pending',
                'created_at' => $a['created_at'],
                'created_at_iso' => $this->formatTimestamp($a['created_at']),
            ];
        }

        usort($all, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));
        $total = count($all);

        return [
            'data'  => array_slice($all, $offset, $limit),
            'total' => $total,
            'page'  => $page,
        ];
    }

    public function markAllRead(): array {
        // Use SQLite's own UTC clock so it matches CURRENT_TIMESTAMP in all tables
        $now  = R::getCell("SELECT datetime('now')");
        $bean = R::findOne('settings', '`key` = ?', ['notifications_last_read']) ?? R::dispense('settings');
        $bean->key   = 'notifications_last_read';
        $bean->value = $now;
        R::store($bean);
        R::exec('UPDATE contacts SET is_read = 1');
        return ['message' => 'Marked as read', 'timestamp' => $now];
    }
}
