<?php
class SmtpMailer {
    private string $host;
    private int    $port;
    private string $user;
    private string $pass;
    private string $fromEmail;
    private string $fromName;
    private string $enc; // tls | ssl | none

    public function __construct(array $cfg) {
        $this->host      = $cfg['smtp_host']       ?? '';
        $this->port      = (int)($cfg['smtp_port'] ?? 587);
        $this->user      = $cfg['smtp_user']        ?? '';
        $this->pass      = $cfg['smtp_pass']        ?? '';
        $this->fromEmail = $cfg['smtp_from_email']  ?? $this->user;
        $this->fromName  = $cfg['smtp_from_name']   ?? 'xComify';
        $this->enc       = strtolower($cfg['smtp_encryption'] ?? 'tls');
    }

    public function isConfigured(): bool {
        return $this->host !== '' && $this->user !== '' && $this->pass !== '';
    }

    public function send(string $to, string $subject, string $htmlBody): bool {
        if (!$this->isConfigured()) return false;

        $timeout = 15;

        if ($this->enc === 'ssl') {
            $ctx  = stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
            $sock = stream_socket_client("ssl://{$this->host}:{$this->port}", $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $ctx);
        } else {
            $sock = fsockopen($this->host, $this->port, $errno, $errstr, $timeout);
        }

        if (!$sock) return false;
        stream_set_timeout($sock, $timeout);

        // Read a full SMTP response (handles multi-line responses)
        $read = function () use ($sock): string {
            $buf = '';
            while (($line = fgets($sock, 512)) !== false) {
                $buf .= $line;
                if (strlen($line) >= 4 && $line[3] === ' ') break;
            }
            return $buf;
        };
        $write = fn(string $s) => fwrite($sock, $s . "\r\n");

        $read(); // Server banner (220 ...)

        $write("EHLO xcomify"); $read();

        if ($this->enc === 'tls') {
            $write('STARTTLS'); $read();
            stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $write("EHLO xcomify"); $read();
        }

        $write('AUTH LOGIN'); $read();
        $write(base64_encode($this->user)); $read();
        $write(base64_encode($this->pass));
        $authResp = $read();
        if (!str_starts_with($authResp, '235')) {
            fclose($sock);
            return false;
        }

        $write("MAIL FROM:<{$this->fromEmail}>"); $read();
        $write("RCPT TO:<{$to}>"); $read();
        $write('DATA'); $read();

        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $msg  = "From: {$this->fromName} <{$this->fromEmail}>\r\n";
        $msg .= "To: {$to}\r\n";
        $msg .= "Subject: {$encodedSubject}\r\n";
        $msg .= "MIME-Version: 1.0\r\n";
        $msg .= "Content-Type: text/html; charset=UTF-8\r\n";
        $msg .= "\r\n";
        $msg .= $htmlBody . "\r\n.";
        $write($msg); $read();

        $write('QUIT');
        fclose($sock);
        return true;
    }
}
