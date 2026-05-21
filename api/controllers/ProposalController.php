<?php
class ProposalController {
    private PDO $db;
    private AiService $ai;

    public function __construct(PDO $db) {
        $this->db = $db;
        $this->ai = new AiService($db);
    }

    public function generate(array $body): array {
        $client   = $body['client_name']  ?? 'Valued Client';
        $service  = $body['service_type'] ?? 'eCommerce Management';
        $budget   = $body['budget']       ?? 'to be discussed';
        $reqs     = $body['requirements'] ?? '';
        $platform = $body['platform']     ?? 'Amazon';

        $system = "You are a senior business development manager at xComify, a premium eCommerce management agency. Write professional, persuasive business proposals.";
        $user   = "Write a complete business proposal for client '{$client}' for {$service} services on {$platform}. Budget: {$budget}. Client requirements: {$reqs}.\n\nInclude these sections:\n1. Executive Summary\n2. Our Approach\n3. Key Deliverables (4 bullet points)\n4. Timeline (3-4 phases)\n5. Investment & Expected ROI\n6. Why Choose xComify\n\nTone: professional, confident, results-focused. Length: ~400 words.";

        try {
            $text = $this->ai->chat($system, $user, 700, 0.7);
            return ['proposal' => $text];
        } catch (\RuntimeException $e) {
            $msg = $e->getMessage();
            if ($msg === 'MODEL_LOADING') {
                return ['proposal' => 'AI model is warming up — please try again in 30 seconds.'];
            }
            return ['proposal' => $msg];
        }
    }

    public function sendEmail(array $body): array {
        $to         = trim($body['to_email']  ?? '');
        $subject    = trim($body['subject']   ?? 'Business Proposal from xComify');
        $proposal   = $body['proposal']       ?? '';
        $clientName = $body['client_name']    ?? '';

        if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'Valid email address required'];
        }

        $htmlBody = "
        <html><body style='font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f9f9f9; padding: 20px;'>
        <div style='background: linear-gradient(135deg, #00D4FF, #7C3AED); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;'>
            <h1 style='color: white; margin: 0; font-size: 28px;'>xComify</h1>
            <p style='color: rgba(255,255,255,0.8); margin: 5px 0 0;'>Premium eCommerce Management</p>
        </div>
        <div style='background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);'>
            " . nl2br(htmlspecialchars($proposal)) . "
        </div>
        <div style='text-align: center; padding: 20px; color: #666; font-size: 12px;'>
            <p>xComify | Premium eCommerce Management Since 2018</p>
        </div>
        </body></html>";

        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'From: xComify <noreply@xcomify.rf.gd>',
            'X-Mailer: PHP/' . phpversion(),
        ];

        $sent = mail($to, $subject, $htmlBody, implode("\r\n", $headers));
        if ($sent) return ['message' => "Proposal sent to {$to}"];
        return ['error' => 'Failed to send email. Check server mail configuration.'];
    }
}
