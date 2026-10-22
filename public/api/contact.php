<?php
declare(strict_types=1);

/*
 * Same-origin handler for the marketing demo form.
 *
 * Secrets remain outside public_html. On cPanel this loads the protected
 * ../leadhive-config.php file relative to the document root, with process
 * environment variables taking precedence when a host provides them.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function loadPrivateConfig(): array
{
    $configuredPath = getenv('LEADHIVE_CONFIG_PATH');
    $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';
    $defaultPath = $documentRoot === '' ? '' : dirname(rtrim($documentRoot, '/\\')) . '/leadhive-config.php';
    $path = is_string($configuredPath) && trim($configuredPath) !== '' ? trim($configuredPath) : $defaultPath;

    if ($path === '' || !is_file($path)) {
        return [];
    }

    $config = require $path;
    return is_array($config) ? $config : [];
}

function configured(string $environmentName, array $config, string $configName): string
{
    $environmentValue = getenv($environmentName);
    if (is_string($environmentValue) && trim($environmentValue) !== '') {
        return trim($environmentValue);
    }

    $configValue = $config[$configName] ?? '';
    return is_string($configValue) ? trim($configValue) : '';
}

function emailAddress(string $value): string
{
    if (preg_match('/<([^>]+)>/', $value, $matches)) {
        return trim($matches[1]);
    }
    return trim($value);
}

function fromHeader(string $value): string
{
    return strpos($value, '<') !== false ? $value : "LeadHive AI <{$value}>";
}

function verifyRecaptcha(string $token, string $secret): bool
{
    $payload = http_build_query([
        'secret' => $secret,
        'response' => $token,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
    ]);
    $response = false;

    if (function_exists('curl_init')) {
        $curl = curl_init('https://www.google.com/recaptcha/api/siteverify');
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 10,
        ]);
        $response = curl_exec($curl);
        curl_close($curl);
    } elseif (filter_var(ini_get('allow_url_fopen'), FILTER_VALIDATE_BOOLEAN)) {
        $context = stream_context_create(['http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $payload,
            'timeout' => 10,
        ]]);
        $response = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
    }

    $result = is_string($response) ? json_decode($response, true) : null;
    return is_array($result) && ($result['success'] ?? false) === true;
}

function sendWithResend(string $apiKey, string $from, string $recipient, string $subject, string $body): bool
{
    $payload = json_encode([
        'from' => fromHeader($from),
        'to' => [$recipient],
        'subject' => $subject,
        'text' => $body,
    ]);
    if (!is_string($payload)) {
        return false;
    }

    if (function_exists('curl_init')) {
        $curl = curl_init('https://api.resend.com/emails');
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer {$apiKey}",
                'Content-Type: application/json',
            ],
        ]);
        $response = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        return is_string($response) && $status >= 200 && $status < 300;
    }

    if (!filter_var(ini_get('allow_url_fopen'), FILTER_VALIDATE_BOOLEAN)) {
        return false;
    }

    $context = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => "Authorization: Bearer {$apiKey}\r\nContent-Type: application/json\r\n",
        'content' => $payload,
        'timeout' => 10,
        'ignore_errors' => true,
    ]]);
    $response = @file_get_contents('https://api.resend.com/emails', false, $context);
    return is_string($response) && isset($http_response_header[0]) && preg_match('/\\s2\\d\\d\\s/', $http_response_header[0]) === 1;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['success' => false, 'message' => 'Method not allowed.']);
}

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 32768) {
    respond(413, ['success' => false, 'message' => 'Request is too large.']);
}

$input = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($input)) {
    respond(400, ['success' => false, 'message' => 'Invalid request.']);
}

$value = static function (string $key) use ($input): string {
    $value = $input[$key] ?? '';
    return is_string($value) ? trim($value) : '';
};

$name = $value('name');
$email = $value('email');
$company = $value('company');
$channels = $value('channels');
$volume = $value('volume');
$website = $value('website');
$token = $value('recaptchaToken');

if ($website !== '') {
    // Do not reveal the honeypot to automated submitters.
    respond(200, ['success' => true]);
}

if ($name === '' || strlen($name) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || $company === '' || strlen($company) > 160 || $channels === '' || strlen($channels) > 100
    || $volume === '' || strlen($volume) > 100 || $token === '' || strlen($token) > 4096) {
    respond(422, ['success' => false, 'message' => 'Please complete all required fields and reCAPTCHA.']);
}

$privateConfig = loadPrivateConfig();
$secret = configured('RECAPTCHA_SECRET_KEY', $privateConfig, 'recaptcha_secret_key');
$recipient = configured('CONTACT_RECIPIENT_EMAIL', $privateConfig, 'to_email');
$from = configured('CONTACT_FROM_EMAIL', $privateConfig, 'from_email');
$resendApiKey = configured('RESEND_API_KEY', $privateConfig, 'resend_api_key');
$recipientAddress = emailAddress($recipient);
$fromAddress = emailAddress($from);
if ($secret === '' || !filter_var($recipientAddress, FILTER_VALIDATE_EMAIL) || !filter_var($fromAddress, FILTER_VALIDATE_EMAIL)) {
    error_log('LeadHive contact form is missing server configuration.');
    respond(500, ['success' => false, 'message' => 'The contact form is temporarily unavailable.']);
}

if (!verifyRecaptcha($token, $secret)) {
    respond(422, ['success' => false, 'message' => 'reCAPTCHA verification failed. Please try again.']);
}

$subject = 'New LeadHive AI demo request';
$body = "Name: {$name}\nEmail: {$email}\nCompany: {$company}\nPrimary channels: {$channels}\nMonthly volume: {$volume}\n";
$headers = [
    'From: ' . fromHeader($from),
    "Reply-To: {$email}",
    'Content-Type: text/plain; charset=UTF-8',
];

if ($resendApiKey !== '') {
    $delivered = sendWithResend($resendApiKey, $from, $recipientAddress, $subject, $body);
} else {
    $delivered = mail($recipientAddress, $subject, $body, implode("\r\n", $headers));
}

if (!$delivered) {
    error_log('LeadHive contact form mail delivery failed.');
    respond(500, ['success' => false, 'message' => 'We could not submit your request. Please try again.']);
}

respond(200, ['success' => true]);
