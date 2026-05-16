<?php
class MediaController {
    private PDO $db;
    private string $uploadDir;

    public function __construct(PDO $db) {
        $this->db        = $db;
        $this->uploadDir = __DIR__ . '/../uploads/';
    }

    public function upload(): array {
        if (empty($_FILES['file'])) {
            http_response_code(400);
            return ['error' => 'No file uploaded'];
        }

        $file    = $_FILES['file'];
        $allowed = ['image/jpeg','image/png','image/gif','image/webp','video/mp4','application/pdf'];

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

        $stmt = $this->db->prepare('INSERT INTO media (filename, original_name, mime_type, size, path) VALUES (?,?,?,?,?)');
        $stmt->execute([$filename, $file['name'], $file['type'], $file['size'], '/api/uploads/' . $filename]);

        return ['id' => (int)$this->db->lastInsertId(), 'path' => '/api/uploads/' . $filename, 'filename' => $filename];
    }

    public function getAll(): array {
        $stmt = $this->db->query('SELECT * FROM media ORDER BY created_at DESC');
        return ['data' => $stmt->fetchAll()];
    }

    public function delete(int $id): array {
        $stmt = $this->db->prepare('SELECT * FROM media WHERE id = ?');
        $stmt->execute([$id]);
        $media = $stmt->fetch();
        if ($media) {
            $filePath = $this->uploadDir . $media['filename'];
            if (file_exists($filePath)) unlink($filePath);
            $this->db->prepare('DELETE FROM media WHERE id = ?')->execute([$id]);
        }
        return ['message' => 'Deleted'];
    }
}
