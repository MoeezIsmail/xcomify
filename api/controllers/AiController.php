<?php
class AiController {
    private AiService $ai;

    public function __construct() {
        $this->ai = new AiService();
    }

    public function getCriteria(): array {
        $row = R::getRow('SELECT value FROM settings WHERE `key` = ?', ['ai_cv_criteria']);
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
        $app = R::getRow('SELECT * FROM applications WHERE id = ?', [$id]);
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
        $bean = R::findOne('settings', '`key` = ?', [$key]) ?? R::dispense('settings');
        $bean->key   = $key;
        $bean->value = $value;
        R::store($bean);
    }
}
