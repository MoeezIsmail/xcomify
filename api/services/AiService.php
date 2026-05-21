<?php
class AiService {
    private PDO $db;

    private const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
    private const GROQ_MODEL = 'llama-3.3-70b-versatile';

    // Chat models for Hugging Face Inference Providers. Provider selection belongs
    // in the model suffix; forcing /hf-inference/models breaks many chat models.
    private const HF_URL = 'https://router.huggingface.co/v1/chat/completions';

    private const HF_MODELS = [
        'openai/gpt-oss-120b:fastest',
        'deepseek-ai/DeepSeek-R1:fastest',
        'katanemo/Arch-Router-1.5B:hf-inference',
    ];

    private const HF_MODELS_CV = [
        'openai/gpt-oss-120b:fastest',
        'deepseek-ai/DeepSeek-R1:fastest',
        'katanemo/Arch-Router-1.5B:hf-inference',
    ];

    private const HF_MODELS_PROPOSAL = [
        'openai/gpt-oss-120b:fastest',
        'deepseek-ai/DeepSeek-R1:fastest',
        'katanemo/Arch-Router-1.5B:hf-inference',
    ];

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    // ─── Token ───────────────────────────────────────────────────────────────

    public function getToken(): string {
        try {
            $stmt = $this->db->prepare('SELECT value FROM settings WHERE `key` = ?');
            $stmt->execute(['huggingface_token']);
            $row = $stmt->fetch();
            return $row ? ($row['value'] ?? '') : '';
        } catch (\Exception $e) {
            return '';
        }
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    public function chat(
        string $system,
        string $user,
        int    $maxTokens   = 600,
        float  $temperature = 0.7
    ): string {
        return $this->dispatch(self::HF_MODELS, $system, $user, $maxTokens, $temperature);
    }

    public function analyzeCV(string $cvText, string $criteria = ''): string {
        $system = "You are an expert HR recruiter and CV analyzer at xComify, "
            . "a premium eCommerce management agency. "
            . "Analyze CVs and provide clear, structured feedback.";

        if ($criteria !== '') {
            $system .= " Hiring criteria: {$criteria}";
        }

        $user = "Analyze this CV and respond with exactly these sections:\n"
            . "1. Score: X/10\n"
            . "2. Key Skills Found\n"
            . "3. Experience Summary\n"
            . "4. Strengths (2-3 points)\n"
            . "5. Weaknesses / Gaps (1-2 points)\n"
            . "6. Recommendation: Shortlist / Maybe / Reject — with a one-line reason\n\n"
            . "CV Content:\n"
            . substr($cvText, 0, 3000);

        return $this->dispatch(self::HF_MODELS_CV, $system, $user, 800, 0.3);
    }

    public function generateProposal(
        string $projectDetails,
        string $clientName = '',
        string $service    = 'eCommerce Management',
        string $platform   = 'Amazon',
        string $budget     = 'to be discussed'
    ): string {
        $system = "You are a senior business development manager at xComify, "
            . "a premium eCommerce management agency. "
            . "Write professional, persuasive business proposals.";

        $clientLine = $clientName !== '' ? "Client: {$clientName}\n" : '';

        $user = "Write a complete business proposal.\n"
            . $clientLine
            . "Service: {$service}\nPlatform: {$platform}\nBudget: {$budget}\n"
            . "Project Details:\n{$projectDetails}\n\n"
            . "Sections:\n"
            . "1. Executive Summary\n2. Our Approach\n3. Key Deliverables (4 points)\n"
            . "4. Timeline (3-4 phases)\n5. Investment & ROI\n6. Why Choose xComify\n\n"
            . "Tone: professional, confident. Length: ~400 words.";

        return $this->dispatch(self::HF_MODELS_PROPOSAL, $system, $user, 1200, 0.7);
    }

    // ─── Internal routing ────────────────────────────────────────────────────

    private function dispatch(
        array  $hfModels,
        string $system,
        string $user,
        int    $maxTokens,
        float  $temperature
    ): string {
        if (!function_exists('curl_init')) {
            throw new \RuntimeException('cURL is not available on this server.');
        }

        $token = $this->getToken();
        if ($token === '') {
            throw new \RuntimeException(
                'AI token not configured. Go to Settings → AI Integration and save your HuggingFace or Groq token.'
            );
        }

        // Groq token starts with gsk_
        if (str_starts_with($token, 'gsk_')) {
            return $this->callEndpoint(
                self::GROQ_URL, self::GROQ_MODEL, $token,
                $system, $user, $maxTokens, $temperature
            );
        }

        return $this->callHuggingFace($hfModels, $token, $system, $user, $maxTokens, $temperature);
    }

    private function callHuggingFace(
        array  $models,
        string $token,
        string $system,
        string $user,
        int    $maxTokens,
        float  $temperature
    ): string {
        $lastError = 'No HuggingFace model available. Try a Groq token (gsk_...) instead.';

        foreach ($models as $model) {
            try {
                return $this->callEndpoint(self::HF_URL, $model, $token, $system, $user, $maxTokens, $temperature);
            } catch (\RuntimeException $e) {
                $msg = $e->getMessage();
                // Skip unsupported / missing models
                if (
                    stripos($msg, 'not supported') !== false ||
                    stripos($msg, 'HTTP 404')      !== false ||
                    stripos($msg, 'HTTP 400')      !== false
                ) {
                    $lastError = $msg;
                    continue;
                }
                throw $e;
            }
        }

        throw new \RuntimeException($lastError);
    }

    private function callEndpoint(
        string $url,
        string $model,
        string $token,
        string $system,
        string $user,
        int    $maxTokens,
        float  $temperature
    ): string {
        $payload = json_encode([
            'model'       => $model,
            'messages'    => [
                ['role' => 'system', 'content' => $system],
                ['role' => 'user',   'content' => $user],
            ],
            'max_tokens'  => $maxTokens,
            'temperature' => $temperature,
            'stream'      => false,
        ]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 60,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                "Authorization: Bearer {$token}",
            ],
        ]);

        $response  = curl_exec($ch);
        $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false || $curlError !== '') {
            throw new \RuntimeException("Network error: {$curlError}");
        }

        $data = json_decode($response, true);

        if ($httpCode === 401 || $httpCode === 403) {
            throw new \RuntimeException(
                "Token rejected (HTTP {$httpCode}). Check Settings → AI Integration."
            );
        }
        if ($httpCode === 429) {
            throw new \RuntimeException('Rate limit reached. Wait a moment and try again.');
        }
        if (
            $httpCode === 503 ||
            (is_array($data) && isset($data['error']) && stripos((string) $data['error'], 'loading') !== false)
        ) {
            throw new \RuntimeException('MODEL_LOADING');
        }
        // 400 with "not supported" = skip this model
        if ($httpCode === 400) {
            $errMsg = is_array($data) && isset($data['error']) ? (string) $data['error'] : "HTTP 400";
            throw new \RuntimeException($errMsg);
        }
        if ($httpCode !== 200) {
            $errMsg = is_array($data) && isset($data['error'])
                ? (string) $data['error']
                : "HTTP {$httpCode}";
            throw new \RuntimeException("AI API error: {$errMsg}");
        }
        if (!is_array($data)) {
            throw new \RuntimeException('Invalid JSON response from AI API.');
        }

        $text = $data['choices'][0]['message']['content'] ?? null;
        if ($text === null) {
            throw new \RuntimeException('Unexpected AI response format.');
        }

        return trim((string) $text);
    }
}
