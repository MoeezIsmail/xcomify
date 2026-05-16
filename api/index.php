<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/ApplicationController.php';
require_once __DIR__ . '/controllers/ContactController.php';
require_once __DIR__ . '/controllers/BlogController.php';
require_once __DIR__ . '/controllers/ServicesController.php';
require_once __DIR__ . '/controllers/TeamController.php';
require_once __DIR__ . '/controllers/PortfolioController.php';
require_once __DIR__ . '/controllers/TestimonialController.php';
require_once __DIR__ . '/controllers/SettingsController.php';
require_once __DIR__ . '/controllers/MediaController.php';

// Parse URL
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Strip /api prefix
$uri = preg_replace('#^/api#', '', $uri);
$uri = rtrim($uri, '/');

// Route dispatch
$db   = Database::getInstance()->getConnection();
$auth = new AuthMiddleware($db);

// Helper to send JSON response
function respond(int $code, $data): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Helper to get request body
function requestBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

// Extract path segments
$segments = explode('/', ltrim($uri, '/'));
$resource = $segments[0] ?? '';
$id       = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : null;
$action   = isset($segments[1]) && !is_numeric($segments[1]) ? $segments[1] : null;
if ($id && isset($segments[2])) $action = $segments[2];

try {
    switch ($resource) {

        case 'auth':
            $ctrl = new AuthController($db);
            if ($action === 'login' && $method === 'POST')  respond(200, $ctrl->login(requestBody()));
            if ($action === 'me'    && $method === 'GET')   respond(200, $ctrl->me($auth->requireAuth()));
            respond(404, ['error' => 'Not found']);

        case 'applications':
            $ctrl = new ApplicationController($db);
            if ($method === 'POST' && !$id)           respond(201, $ctrl->create());
            $auth->requireAuth(); // protect remaining
            if ($method === 'GET' && !$id)            respond(200, $ctrl->getAll());
            if ($method === 'GET' && $id)             respond(200, $ctrl->getOne($id));
            if ($method === 'PUT' && $id)             respond(200, $ctrl->update($id, requestBody()));
            if ($method === 'DELETE' && $id)          respond(200, $ctrl->delete($id));
            respond(404, ['error' => 'Not found']);

        case 'contact':
            $ctrl = new ContactController($db);
            if ($method === 'POST')                   respond(201, $ctrl->create(requestBody()));
            respond(404, ['error' => 'Not found']);

        case 'contacts':
            $ctrl = new ContactController($db);
            $auth->requireAuth();
            if ($method === 'GET' && !$id)            respond(200, $ctrl->getAll());
            if ($method === 'DELETE' && $id)          respond(200, $ctrl->delete($id));
            if ($method === 'PUT' && $id && $action === 'read') respond(200, $ctrl->markRead($id));
            respond(404, ['error' => 'Not found']);

        case 'blogs':
            $ctrl = new BlogController($db);
            if ($method === 'GET' && !$id && !$action) respond(200, $ctrl->getAll());
            if ($method === 'GET' && $action)          respond(200, $ctrl->getBySlug($action));
            $auth->requireAuth();
            if ($method === 'POST')                    respond(201, $ctrl->create(requestBody()));
            if ($method === 'PUT' && $id)              respond(200, $ctrl->update($id, requestBody()));
            if ($method === 'DELETE' && $id)           respond(200, $ctrl->delete($id));
            respond(404, ['error' => 'Not found']);

        case 'services':
            $ctrl = new ServicesController($db);
            if ($method === 'GET')                    respond(200, $ctrl->getAll());
            $auth->requireAuth();
            if ($method === 'POST')                   respond(201, $ctrl->create(requestBody()));
            if ($method === 'PUT' && $id)             respond(200, $ctrl->update($id, requestBody()));
            if ($method === 'DELETE' && $id)          respond(200, $ctrl->delete($id));
            respond(404, ['error' => 'Not found']);

        case 'team':
            $ctrl = new TeamController($db);
            if ($method === 'GET')                    respond(200, $ctrl->getAll());
            $auth->requireAuth();
            if ($method === 'POST')                   respond(201, $ctrl->create(requestBody()));
            if ($method === 'PUT' && $id)             respond(200, $ctrl->update($id, requestBody()));
            if ($method === 'DELETE' && $id)          respond(200, $ctrl->delete($id));
            respond(404, ['error' => 'Not found']);

        case 'portfolio':
            $ctrl = new PortfolioController($db);
            if ($method === 'GET')                    respond(200, $ctrl->getAll());
            $auth->requireAuth();
            if ($method === 'POST')                   respond(201, $ctrl->create(requestBody()));
            if ($method === 'PUT' && $id)             respond(200, $ctrl->update($id, requestBody()));
            if ($method === 'DELETE' && $id)          respond(200, $ctrl->delete($id));
            respond(404, ['error' => 'Not found']);

        case 'testimonials':
            $ctrl = new TestimonialController($db);
            if ($method === 'GET')                    respond(200, $ctrl->getAll());
            $auth->requireAuth();
            if ($method === 'POST')                   respond(201, $ctrl->create(requestBody()));
            if ($method === 'PUT' && $id)             respond(200, $ctrl->update($id, requestBody()));
            if ($method === 'DELETE' && $id)          respond(200, $ctrl->delete($id));
            respond(404, ['error' => 'Not found']);

        case 'settings':
            $ctrl = new SettingsController($db);
            if ($method === 'GET')                    respond(200, $ctrl->get());
            $auth->requireAuth();
            if ($method === 'PUT')                    respond(200, $ctrl->update(requestBody()));
            respond(404, ['error' => 'Not found']);

        case 'media':
            $ctrl = new MediaController($db);
            $auth->requireAuth();
            if ($method === 'POST' && $action === 'upload') respond(201, $ctrl->upload());
            if ($method === 'GET')                    respond(200, $ctrl->getAll());
            if ($method === 'DELETE' && $id)          respond(200, $ctrl->delete($id));
            respond(404, ['error' => 'Not found']);

        default:
            respond(404, ['error' => 'API endpoint not found']);
    }
} catch (Exception $e) {
    respond(500, ['error' => $e->getMessage()]);
}
