<?php
class AiController {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getCriteria(): array {
        $stmt = $this->db->prepare('SELECT value FROM settings WHERE `key` = ?');
        $stmt->execute(['ai_cv_criteria']);
        $row = $stmt->fetch();
        $defaults = [
            'required_skills' => 'Amazon PPC, Shopify, eCommerce, SEO',
            'min_experience' => '1 year',
            'preferred_platforms' => 'Amazon, Etsy, Shopify, TikTok Shop',
            'scoring_focus' => 'skills match, experience level, communication',
        ];
        return $row ? (json_decode($row['value'], true) ?? $defaults) : $defaults;
    }

    public function saveCriteria(array $body): array {
        $val = json_encode($body);
        // ON DUPLICATE KEY for MySQL, INSERT OR REPLACE for SQLite
        try {
            $this->db->prepare("INSERT INTO settings (`key`, value) VALUES ('ai_cv_criteria', ?) ON DUPLICATE KEY UPDATE value = ?")->execute([$val, $val]);
        } catch (\Exception $e) {
            try {
                $this->db->prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('ai_cv_criteria', ?)")->execute([$val]);
            } catch (\Exception $e2) {
                $s = $this->db->prepare('SELECT id FROM settings WHERE `key` = ?');
                $s->execute(['ai_cv_criteria']);
                if ($s->fetch()) {
                    $this->db->prepare('UPDATE settings SET value = ? WHERE `key` = ?')->execute([$val, 'ai_cv_criteria']);
                } else {
                    $this->db->prepare('INSERT INTO settings (`key`, value) VALUES (?, ?)')->execute(['ai_cv_criteria', $val]);
                }
            }
        }
        return ['message' => 'Criteria saved'];
    }

    public function analyzeApplication(int $id): array {
        $stmt = $this->db->prepare('SELECT * FROM applications WHERE id = ?');
        $stmt->execute([$id]);
        $app = $stmt->fetch();
        if (!$app) { http_response_code(404); return ['error' => 'Application not found']; }

        $criteria = $this->getCriteria();

        $systemCtx = "You are a senior HR analyst at xComify, a premium eCommerce management agency. Evaluate job applications concisely.";
        $userMsg   = "Analyze this job application for an eCommerce role.\n\nHiring Criteria:\n- Required Skills: {$criteria['required_skills']}\n- Min Experience: {$criteria['min_experience']}\n- Preferred Platforms: {$criteria['preferred_platforms']}\n- Scoring Focus: {$criteria['scoring_focus']}\n\nApplicant Details:\nName: {$app['full_name']}\nSkills: {$app['skills']}\nExperience: {$app['experience']}\nCity: {$app['city']}\nExpected Salary: {$app['expected_salary']}\nCover Letter: " . substr($app['cover_letter'] ?? '', 0, 300) . "\n\nProvide a structured response with:\n1. Score: X/10\n2. Key Strengths (2-3 bullet points)\n3. Concerns (1-2 bullet points)\n4. Recommendation: Hire / Review / Reject — with a one-line reason.";

        $prompt  = "<s>[INST] {$systemCtx}\n\n{$userMsg} [/INST]";
        $hfToken = $this->getHFToken();
        $result  = $this->callHuggingFace(
            'mistralai/Mistral-7B-Instruct-v0.3',
            ['inputs' => $prompt, 'parameters' => ['max_new_tokens' => 350, 'temperature' => 0.3, 'return_full_text' => false]],
            $hfToken
        );

        if (is_array($result) && isset($result[0]['generated_text'])) {
            $analysis = trim($result[0]['generated_text']);
        } elseif (isset($result['error'])) {
            $analysis = stripos($result['error'], 'loading') !== false
                ? 'AI model is warming up — please try again in 30 seconds.'
                : 'Analysis failed: ' . $result['error'];
        } else {
            $analysis = 'Analysis unavailable. Please check your HuggingFace API token in Site Settings → AI Integration.';
        }

        return ['analysis' => $analysis, 'applicant' => $app['full_name']];
    }

    private function getHFToken(): string {
        try {
            $stmt = $this->db->prepare('SELECT value FROM settings WHERE `key` = ?');
            $stmt->execute(['huggingface_token']);
            $row = $stmt->fetch();
            return $row['value'] ?? '';
        } catch (\Exception $e) {
            return '';
        }
    }

    private function callHuggingFace(string $model, array $payload, string $token): mixed {
        $url = "https://api-inference.huggingface.co/models/{$model}";
        $data = json_encode($payload);
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $data,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                "Authorization: Bearer {$token}",
            ],
            CURLOPT_TIMEOUT => 60,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
        return json_decode($response, true);
    }
}
