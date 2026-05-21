<?php
class ChatController {
    private AiService $ai;

    public function __construct() {
        $this->ai = new AiService();
    }

    public function chat(array $body): array {
        $message = trim($body['message'] ?? '');
        if (!$message) {
            http_response_code(400);
            return ['error' => 'Message required'];
        }

        $system = "You are xComify's helpful AI assistant. xComify is a premium eCommerce agency managing Amazon, Etsy, Shopify, TikTok Shop, Walmart, eBay. Services: Amazon VA, PPC management, product hunting, Shopify development, AI automation. Be concise and professional.";

        try {
            $reply = $this->ai->chat($system, $message, 200, 0.7);
            return ['reply' => $reply];
        } catch (\RuntimeException $e) {
            $msg = $e->getMessage();
            if ($msg === 'MODEL_LOADING') {
                return ['reply' => 'Our AI is warming up — please try again in 20 seconds!'];
            }
            // Fallback to keyword responses on token/network errors
            return ['reply' => $this->keywordFallback($message)];
        }
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
             'reply' => "TikTok Shop is one of the fastest growing platforms! We've launched brands from zero and hit \$1M+ in 90 days. Our team handles creator outreach, ads, and fulfillment strategy."],

            ['keys' => ['contact', 'reach', 'talk', 'speak', 'call', 'email'],
             'reply' => "You can reach us at hello@xcomify.com, or book a free 30-minute strategy call on our Contact page. We typically respond within 2 hours! 📞"],

            ['keys' => ['hello', 'hi', 'hey', 'good morning', 'good evening', 'assalam'],
             'reply' => "Hello! 👋 Welcome to xComify. I'm your AI assistant. How can I help you scale your eCommerce business today?"],

            ['keys' => ['service', 'services', 'what do you do', 'what do you offer', 'offer'],
             'reply' => "We offer: Amazon VA & PPC Management, Shopify Development, Etsy SEO, TikTok Shop Launch, Walmart & eBay Management, Product Hunting, and AI Automation. Which are you interested in?"],

            ['keys' => ['result', 'case study', 'portfolio', 'success', 'proof'],
             'reply' => "Our results speak for themselves: \$12M+ revenue generated for clients, 500+ active clients, 97% satisfaction rate. Check our Portfolio page for detailed case studies!"],

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
}
