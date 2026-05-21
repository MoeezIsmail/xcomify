<?php
class AdvertisementController {
    public function __construct() {}

    public function getActive(): array {
        $row = R::getRow(
            "SELECT * FROM advertisements WHERE is_active = 1 AND (starts_at IS NULL OR starts_at <= CURRENT_TIMESTAMP) AND (ends_at IS NULL OR ends_at >= CURRENT_TIMESTAMP) ORDER BY created_at DESC LIMIT 1"
        );
        return $row ?: [];
    }

    public function getAll(): array {
        $data = R::getAll('SELECT * FROM advertisements ORDER BY created_at DESC');
        return ['data' => $data];
    }

    public function create(array $b): array {
        $bean = R::dispense('advertisements');
        $bean->title       = $b['title']       ?? '';
        $bean->description = $b['description'] ?? '';
        $bean->image_url   = $b['image_url']   ?? '';
        $bean->cta_text    = $b['cta_text']    ?? '';
        $bean->cta_link    = $b['cta_link']    ?? '';
        $bean->bg_color    = $b['bg_color']    ?? '#00D4FF';
        $bean->badge_text  = $b['badge_text']  ?? '';
        $bean->is_active   = (int)($b['is_active'] ?? 1);
        $bean->starts_at   = $b['starts_at'] ?: null;
        $bean->ends_at     = $b['ends_at']   ?: null;
        $id = R::store($bean);

        return ['id' => (int)$id, 'message' => 'Created'];
    }

    public function update(int $id, array $b): array {
        R::exec(
            'UPDATE advertisements SET title=?,description=?,image_url=?,cta_text=?,cta_link=?,bg_color=?,badge_text=?,is_active=?,starts_at=?,ends_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?',
            [
                $b['title']       ?? '',
                $b['description'] ?? '',
                $b['image_url']   ?? '',
                $b['cta_text']    ?? '',
                $b['cta_link']    ?? '',
                $b['bg_color']    ?? '#00D4FF',
                $b['badge_text']  ?? '',
                (int)($b['is_active'] ?? 1),
                $b['starts_at'] ?: null,
                $b['ends_at']   ?: null,
                $id,
            ]
        );
        return ['message' => 'Updated'];
    }

    public function delete(int $id): array {
        R::exec('DELETE FROM advertisements WHERE id = ?', [$id]);
        return ['message' => 'Deleted'];
    }
}
