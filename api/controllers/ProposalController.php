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

        $system = "You are a business development manager at xComify. Write the proposal directly — no preamble like 'Here is a proposal', no closing AI remarks. Plain text only, no markdown, no asterisks, no # symbols.";
        $user   = "Write a business proposal for this client:\nClient: {$client}\nService: {$service}\nPlatform: {$platform}\nBudget: {$budget}\nNotes: {$reqs}\n\nUse EXACTLY this structure, no deviations:\n\nDear {$client},\n\nEXECUTIVE SUMMARY\n[2-3 sentences about what xComify will do for this client]\n\nOUR APPROACH\n[2-3 sentences on methodology and process]\n\nKEY DELIVERABLES\n1. [specific deliverable]\n2. [specific deliverable]\n3. [specific deliverable]\n4. [specific deliverable]\n\nTIMELINE\nPhase 1 — [name] ([duration]): [brief description]\nPhase 2 — [name] ([duration]): [brief description]\nPhase 3 — [name] ([duration]): [brief description]\n\nINVESTMENT & EXPECTED ROI\n[2-3 sentences on pricing and measurable outcomes]\n\nWHY CHOOSE XCOMIFY\n[2-3 sentences on competitive advantage and track record]\n\nBest regards,\nxComify Team";

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

        if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'Valid email address required'];
        }

        $htmlBody = "<html><body style='font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f9f9f9; padding: 20px;'>
<div style='background: linear-gradient(135deg, #00D4FF, #7C3AED); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;'>
    <h1 style='color: white; margin: 0; font-size: 28px;'>xComify</h1>
    <p style='color: rgba(255,255,255,0.8); margin: 5px 0 0;'>Premium eCommerce Management</p>
</div>
<div style='background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); white-space: pre-wrap; line-height: 1.7; color: #333; font-size: 14px;'>"
    . htmlspecialchars($proposal) .
"</div>
<div style='text-align: center; padding: 20px; color: #666; font-size: 12px;'>
    <p>xComify | Premium eCommerce Management Since 2018</p>
</div>
</body></html>";

        // Try SMTP first
        $smtpCfg = $this->getSmtpConfig();
        $mailer  = new SmtpMailer($smtpCfg);

        if ($mailer->isConfigured()) {
            $sent = $mailer->send($to, $subject, $htmlBody);
            if ($sent) return ['message' => "Proposal sent to {$to}"];
            return ['error' => 'SMTP send failed. Check Settings → Email for correct credentials.'];
        }

        // Fallback to PHP mail()
        $headers = implode("\r\n", [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'From: xComify <noreply@xcomify.com>',
        ]);
        $sent = mail($to, $subject, $htmlBody, $headers);
        if ($sent) return ['message' => "Proposal sent to {$to}"];
        return ['error' => 'Email delivery failed. Configure SMTP in Settings → Email for reliable sending.'];
    }

    private function getSmtpConfig(): array {
        $keys = ['smtp_host', 'smtp_port', 'smtp_encryption', 'smtp_user', 'smtp_pass', 'smtp_from_name', 'smtp_from_email'];
        $cfg  = [];
        $stmt = $this->db->prepare('SELECT value FROM settings WHERE `key` = ?');
        foreach ($keys as $k) {
            $stmt->execute([$k]);
            $row = $stmt->fetch();
            $cfg[$k] = $row ? $row['value'] : '';
        }
        return $cfg;
    }
}
