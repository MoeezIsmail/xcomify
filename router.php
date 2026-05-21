<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri === '/api' || str_starts_with($uri, '/api/')) {
    require __DIR__ . '/api/index.php';
    return;
}

if (is_file(__DIR__ . $uri)) {
    return false; // serve static file normally
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
