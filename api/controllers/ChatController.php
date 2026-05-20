<?php
class ChatController {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function chat(array $body): array {
        $message = trim($body['message'] ?? '');
        if (!$message) {
            http_response_code(400);
            return ['error' => 'Message required'];
        }

        $hfToken = $this->getHFToken();

        // If token is set, try HuggingFace
        if ($hfToken) {
            $reply = $this->callHuggingFace($message, $hfToken);
            if ($reply) {
                return ['reply' => $reply];
            }
        }

        // Fallback: smart keyword-based responses
        return ['reply' => $this->keywordFallback($message)];
    }

    private function callHuggingFace(string $message, string $token): ?string {
        if (!function_exists('curl_init')) return null;

        $systemCtx = "You are xComify's helpful AI assistant. xComify is a premium eCommerce agency managing Amazon, Etsy, Shopify, TikTok Shop, Walmart, eBay. Services: Amazon VA, PPC management, product hunting, Shopify development, AI automation. Be concise and professional.";
        $prompt = "<s>[INST] {$systemCtx}\n\nUser: {$message} [/INST]";

        $url = 'https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions';
        $payload = json_encode([
            'model'       => 'mistralai/Mistral-7B-Instruct-v0.3',
            'messages'    => [
                ['role' => 'system', 'content' => "You are xComify's helpful AI assistant. xComify is a premium eCommerce agency managing Amazon, Etsy, Shopify, TikTok Shop, Walmart, eBay. Be concise and professional."],
                ['role' => 'user',   'content' => $message],
            ],
            'max_tokens'  => 200,
            'temperature' => 0.7,
            'stream'      => false,
        ]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                "Authorization: Bearer {$token}",
            ],
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (!$response || $httpCode !== 200) return null;

        $data = json_decode($response, true);
        if (isset($data['choices'][0]['message']['content'])) {
            return trim($data['choices'][0]['message']['content']);
        }
        if (isset($data['error']) && strpos($data['error'], 'loading') !== false) {
            return 'Our AI is warming up — please try again in 20 seconds!';
        }
        return null;
    }

    private function keywordFallback(string $message): string {
        $msg = strtolower($message);

        $responses = [
            ['keys' => ['price', 'pricing', 'cost', 'how much', 'fee', 'plan'],
             'reply' => "Our pricing varies by service and scope. Check out our Pricing page for detailed packages, or book a free strategy call and we'll build a custom plan for you! 💼"],

            ['keys' => ['amazon', 'fba', 'ppc', 'acos', 'listing'],
             'reply' => "We offer full Amazon management — FBA setup, PPC campaigns, listing optimization, and brand management. We've helped clients reduce ACoS below 18% and grow revenue 300%+. Want to know more?"],

            ['keys' => ['shopify', 'store', 'website', 'ecommerce store'],
             'reply' => "Our Shopify team handles everything from store design to conversion rate optimization. We took one client from 0.8% to 4.2% CVR! Ready to scale your store?"],

            ['keys' => ['etsy', 'handmade', 'craft'],
             'reply' => "We specialize in Etsy SEO, shop branding, and organic growth. Our clients consistently reach Top 10 rankings. We'd love to help grow your Etsy shop!"],

            ['keys' => ['tiktok', 'tiktok shop', 'social'],
             'reply' => "TikTok Shop is one of the fastest growing platforms! We've launched brands from zero and hit $1M+ in 90 days. Our team handles creator outreach, ads, and fulfillment strategy."],

            ['keys' => ['contact', 'reach', 'talk', 'speak', 'call', 'email'],
             'reply' => "You can reach us at hello@xcomify.com, or book a free 30-minute strategy call on our Contact page. We typically respond within 2 hours! 📞"],

            ['keys' => ['hello', 'hi', 'hey', 'good morning', 'good evening', 'assalam'],
             'reply' => "Hello! 👋 Welcome to xComify. I'm your AI assistant. How can I help you scale your eCommerce business today?"],

            ['keys' => ['service', 'services', 'what do you do', 'what do you offer', 'offer'],
             'reply' => "We offer: Amazon VA & PPC Management, Shopify Development, Etsy SEO, TikTok Shop Launch, Walmart & eBay Management, Product Hunting, and AI Automation. Which are you interested in?"],

            ['keys' => ['result', 'case study', 'portfolio', 'success', 'proof'],
             'reply' => "Our results speak for themselves: $12M+ revenue generated for clients, 500+ active clients, 97% satisfaction rate. Check our Portfolio page for detailed case studies!"],

            ['keys' => ['start', 'begin', 'onboard', 'get started', 'how to start'],
             'reply' => "Getting started is easy! 1️⃣ Book a free strategy call, 2️⃣ We audit your current setup, 3️⃣ Build a custom growth plan, 4️⃣ Execute and scale. Book your call on the Contact page!"],
        ];

        foreach ($responses as $r) {
            foreach ($r['keys'] as $k) {
                if (strpos($msg, $k) !== false) {
                    return $r['reply'];
                }
            }
        }

        return "Thanks for reaching out! I'd be happy to help you scale your eCommerce business. Could you tell me more about your current platform (Amazon, Shopify, Etsy, etc.) or what you're looking to achieve? 🚀";
    }

    private function getHFToken(): string {
        try {
            // Use compatible query for both SQLite and MySQL
            $stmt = $this->db->prepare('SELECT value FROM settings WHERE `key` = ?');
            $stmt->execute(['huggingface_token']);
            $row = $stmt->fetch();
            return $row['value'] ?? '';
        } catch (Exception $e) {
            return '';
        }
    }
}
