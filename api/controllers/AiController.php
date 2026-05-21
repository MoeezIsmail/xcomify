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

        $system = "You are an HR analyst at xComify. Output plain text only — no markdown, no asterisks, no # headers. No preamble, no closing remarks, no suggestions. Only the structured evaluation.";
        $coverSnippet = substr($app['cover_letter'] ?? 'None', 0, 300);
        $user   = "Evaluate this candidate for an eCommerce role at xComify.\n\nHiring criteria: required skills: {$criteria['required_skills']} | min experience: {$criteria['min_experience']} | platforms: {$criteria['preferred_platforms']} | focus: {$criteria['scoring_focus']}\n\nCandidate:\nName: {$app['full_name']}\nSkills: {$app['skills']}\nExperience: {$app['experience']}\nCity: {$app['city']}\nSalary: {$app['expected_salary']}\nCover letter: {$coverSnippet}\n\nReply using EXACTLY this format, nothing else:\n\nScore: X/10\n\nStrengths:\n• [strength 1]\n• [strength 2]\n\nConcerns:\n• [concern 1]\n\nDecision: [Hire / Review / Reject] — [one sentence reason]";

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
