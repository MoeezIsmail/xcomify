<?php
class MediaController {
    private string $uploadDir;

    public function __construct() {
        $this->uploadDir = __DIR__ . '/../uploads/';
    }

    public function upload(): array {
        if (empty($_FILES['file'])) {
            http_response_code(400);
            return ['error' => 'No file uploaded'];
        }

        $file    = $_FILES['file'];
        $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf'];

        if (!in_array($file['type'], $allowed)) {
            http_response_code(400);
            return ['error' => 'File type not allowed'];
        }

        if ($file['size'] > 20 * 1024 * 1024) {
            http_response_code(400);
            return ['error' => 'File too large (max 20MB)'];
        }

        $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('media_') . '.' . $ext;
        $path     = $this->uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $path)) {
            http_response_code(500);
            return ['error' => 'Upload failed'];
        }

        $bean                = R::dispense('media');
        $bean->filename      = $filename;
        $bean->original_name = $file['name'];
        $bean->mime_type     = $file['type'];
        $bean->size          = $file['size'];
        $bean->path          = '/api/uploads/' . $filename;
        $id = R::store($bean);

        return ['id' => (int)$id, 'path' => '/api/uploads/' . $filename, 'filename' => $filename];
    }

    public function getAll(): array {
        $data = R::getAll('SELECT * FROM media ORDER BY created_at DESC');
        return ['data' => $data];
    }

    public function delete(int $id): array {
        $media = R::getRow('SELECT * FROM media WHERE id = ?', [$id]);
        if ($media) {
            $filePath = $this->uploadDir . $media['filename'];
            if (file_exists($filePath)) unlink($filePath);
            R::exec('DELETE FROM media WHERE id = ?', [$id]);
        }
        return ['message' => 'Deleted'];
    }
}
