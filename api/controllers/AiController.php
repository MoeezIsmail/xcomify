<?php
class AiController {
    private PDO $db;
    private AiService $ai;

    public function __construct(PDO $db) {
        $this->db = $db;
        $this->ai = new AiService($db);
    }

    public function getCriteria(): array {
        $stmt = $this->db->prepare('SELECT value FROM settings WHERE `key` = ?');
        $stmt->execute(['ai_cv_criteria']);
        $row = $stmt->fetch();
        $defaults = [
            'required_skills'      => 'Amazon PPC, Shopify, eCommerce, SEO',
            'min_experience'       => '1 year',
            'preferred_platforms'  => 'Amazon, Etsy, Shopify, TikTok Shop',
            'scoring_focus'        => 'skills match, experience level, communication',
        ];
        return $row ? (json_decode($row['value'], true) ?? $defaults) : $defaults;
    }

    public function saveCriteria(array $body): array {
        $this->upsertSetting('ai_cv_criteria', json_encode($body));
        return ['message' => 'Criteria saved'];
    }

    public function analyzeApplication(int $id): array {
        $stmt = $this->db->prepare('SELECT * FROM applications WHERE id = ?');
        $stmt->execute([$id]);
        $app = $stmt->fetch();
        if (!$app) {
            http_response_code(404);
            return ['error' => 'Application not found'];
        }

        $criteria = $this->getCriteria();

        $system = "You are a senior HR analyst at xComify, a premium eCommerce management agency. Evaluate job applications concisely.";
        $user   = "Analyze this job application for an eCommerce role.\n\nHiring Criteria:\n- Required Skills: {$criteria['required_skills']}\n- Min Experience: {$criteria['min_experience']}\n- Preferred Platforms: {$criteria['preferred_platforms']}\n- Scoring Focus: {$criteria['scoring_focus']}\n\nApplicant Details:\nName: {$app['full_name']}\nSkills: {$app['skills']}\nExperience: {$app['experience']}\nCity: {$app['city']}\nExpected Salary: {$app['expected_salary']}\nCover Letter: " . substr($app['cover_letter'] ?? '', 0, 300) . "\n\nProvide a structured response with:\n1. Score: X/10\n2. Key Strengths (2-3 bullet points)\n3. Concerns (1-2 bullet points)\n4. Recommendation: Hire / Review / Reject — with a one-line reason.";

        try {
            $analysis = $this->ai->chat($system, $user, 350, 0.3);
        } catch (\RuntimeException $e) {
            $msg = $e->getMessage();
            $analysis = $msg === 'MODEL_LOADING'
                ? 'AI model is warming up — please try again in 30 seconds.'
                : $msg;
        }

        return ['analysis' => $analysis, 'applicant' => $app['full_name']];
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
