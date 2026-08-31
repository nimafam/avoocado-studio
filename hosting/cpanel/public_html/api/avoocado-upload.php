<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$siteRoot = dirname(__DIR__);
$configRoot = dirname($siteRoot);
while (basename($configRoot) !== 'public_html' && dirname($configRoot) !== $configRoot) {
    $configRoot = dirname($configRoot);
}
$accountRoot = basename($configRoot) === 'public_html' ? dirname($configRoot) : dirname($siteRoot);
$configPath = $accountRoot . '/avoocado-storage-config.php';
if (!is_file($configPath)) respond(503, ['error' => 'Storage is not configured.']);
$config = require $configPath;
$secret = is_array($config) ? ($config['upload_secret'] ?? '') : '';
$providedSecret = $_SERVER['HTTP_X_AVOOCADO_KEY'] ?? '';
if (!is_string($secret) || strlen($secret) < 32 || !is_string($providedSecret) || !hash_equals($secret, $providedSecret)) respond(401, ['error' => 'Unauthorized.']);

$uploadRoot = $siteRoot . '/uploads';
$baseUrl = rtrim((string)($config['public_base_url'] ?? 'https://storage.avoocadostudio.com/uploads'), '/');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    $url = is_array($body) ? (string)($body['url'] ?? '') : '';
    $prefix = $baseUrl . '/';
    if (strpos($url, $prefix) !== 0) respond(400, ['error' => 'Invalid file URL.']);
    $relative = rawurldecode(substr($url, strlen($prefix)));
    if (!preg_match('#^(orders|artworks)/[0-9]{4}/[0-9]{2}/[a-zA-Z0-9._-]+\.(png|jpe?g|webp)$#', $relative)) respond(400, ['error' => 'Invalid file path.']);
    $target = $uploadRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative);
    if (!is_file($target)) respond(404, ['error' => 'File not found.']);
    if (!unlink($target)) respond(500, ['error' => 'Could not delete file.']);
    respond(200, ['deleted' => true]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['error' => 'Method not allowed.']);
$scope = (string)($_POST['scope'] ?? '');
if (!in_array($scope, ['orders', 'artworks'], true)) respond(400, ['error' => 'Invalid upload scope.']);
if (!isset($_FILES['file']) || !is_array($_FILES['file'])) respond(400, ['error' => 'File is required.']);
$file = $_FILES['file'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) respond(400, ['error' => 'Upload failed.']);
$maxBytes = $scope === 'orders' ? 2_000_000 : 8 * 1024 * 1024;
if (($file['size'] ?? 0) < 1 || $file['size'] > $maxBytes) respond(413, ['error' => 'File is too large.']);

$mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
$extensions = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp'];
if (!isset($extensions[$mime])) respond(415, ['error' => 'Unsupported image type.']);

$year = gmdate('Y');
$month = gmdate('m');
$directory = $uploadRoot . DIRECTORY_SEPARATOR . $scope . DIRECTORY_SEPARATOR . $year . DIRECTORY_SEPARATOR . $month;
if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) respond(500, ['error' => 'Could not create upload directory.']);
$label = preg_replace('/[^a-zA-Z0-9_-]+/', '-', (string)($_POST['label'] ?? 'file')) ?: 'file';
$filename = trim($label, '-') . '-' . bin2hex(random_bytes(12)) . '.' . $extensions[$mime];
$target = $directory . DIRECTORY_SEPARATOR . $filename;
if (!move_uploaded_file($file['tmp_name'], $target)) respond(500, ['error' => 'Could not store file.']);
chmod($target, 0644);
$relative = $scope . '/' . $year . '/' . $month . '/' . $filename;
respond(201, ['url' => $baseUrl . '/' . $relative, 'path' => $relative]);
