<?php
class ApplicationController {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getAll(): array {
        $page     = max(1, (int)($_GET['page'] ?? 1));
        $limit    = min(50, max(1, (int)($_GET['limit'] ?? 20)));
        $offset   = ($page - 1) * $limit;
        $status   = $_GET['status'] ?? '';
        $search   = $_GET['search'] ?? '';

        $where  = ['1=1'];
        $params = [];

        if ($status) { $where[] = 'status = ?'; $params[] = $status; }
        if ($search) { $where[] = '(full_name LIKE ? OR email LIKE ?)'; $params[] = "%$search%"; $params[] = "%$search%"; }

        $sql = 'SELECT * FROM applications WHERE ' . implode(' AND ', $where) . ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $data = $stmt->fetchAll();

        $countParams = array_slice($params, 0, -2);
        $countStmt   = $this->db->prepare('SELECT COUNT(*) FROM applications WHERE ' . implode(' AND ', $where));
        $countStmt->execute($countParams);
        $total = (int)$countStmt->fetchColumn();

        return compact('data', 'total', 'page', 'limit');
    }

    public function getOne(int $id): array {
        $stmt = $this->db->prepare('SELECT * FROM applications WHERE id = ?');
        $stmt->execute([$id]);
        $app = $stmt->fetch();
        if (!$app) { http_response_code(404); return ['error' => 'Not found']; }
        return $app;
    }

    public function create(): array {
        // Handle multipart/form-data
        $data = [
            'full_name'       => trim($_POST['full_name'] ?? ''),
            'email'           => trim($_POST['email'] ?? ''),
            'phone'           => trim($_POST['phone'] ?? ''),
            'city'            => trim($_POST['city'] ?? ''),
            'skills'          => trim($_POST['skills'] ?? ''),
            'experience'      => trim($_POST['experience'] ?? ''),
            'portfolio_link'  => trim($_POST['portfolio_link'] ?? ''),
            'expected_salary' => trim($_POST['expected_salary'] ?? ''),
            'cover_letter'    => trim($_POST['cover_letter'] ?? ''),
        ];

        if (!$data['full_name'] || !$data['email']) {
            http_response_code(400);
            return ['error' => 'Full name and email are required'];
        }

        // Handle CV upload
        $cvPath = null;
        if (!empty($_FILES['cv']['name'])) {
            $uploadDir = __DIR__ . '/../uploads/';
            $ext       = pathinfo($_FILES['cv']['name'], PATHINFO_EXTENSION);
            $filename  = uniqid('cv_') . '.' . $ext;
            if (move_uploaded_file($_FILES['cv']['tmp_name'], $uploadDir . $filename)) {
                $cvPath = '/api/uploads/' . $filename;
            }
        }
        $data['cv_path'] = $cvPath;

        $stmt = $this->db->prepare('
            INSERT INTO applications (full_name, email, phone, city, skills, experience, portfolio_link, expected_salary, cover_letter, cv_path)
            VALUES (:full_name, :email, :phone, :city, :skills, :experience, :portfolio_link, :expected_salary, :cover_letter, :cv_path)
        ');
        $stmt->execute($data);

        return ['id' => (int)$this->db->lastInsertId(), 'message' => 'Application submitted successfully'];
    }

    public function update(int $id, array $body): array {
        $allowed = ['status', 'full_name', 'email', 'phone', 'city', 'skills', 'experience'];
        $sets    = [];
        $params  = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $body)) {
                $sets[]   = "$field = ?";
                $params[] = $body[$field];
            }
        }

        if (empty($sets)) { http_response_code(400); return ['error' => 'Nothing to update']; }

        $params[] = $id;
        $this->db->prepare('UPDATE applications SET ' . implode(', ', $sets) . ', updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                  ->execute($params);

        return ['message' => 'Updated successfully'];
    }

    public function delete(int $id): array {
        $this->db->prepare('DELETE FROM applications WHERE id = ?')->execute([$id]);
        return ['message' => 'Deleted successfully'];
    }
}
