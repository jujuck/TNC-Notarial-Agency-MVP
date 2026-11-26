<?php

declare(strict_types=1);

require dirname(__DIR__) . '/vendor/autoload.php';

try {
    /** @var \Slim\App<\Psr\Container\ContainerInterface> $app */
    $app = require dirname(__DIR__) . '/config/bootstrap.php';
    $app->run();
} catch (Throwable $exception) {
    error_log(sprintf('Bootstrap failure: %s', $exception->getMessage()));

    http_response_code(500);
    header('Content-Type: application/problem+json; charset=utf-8');
    echo json_encode(
        [
            'type' => 'about:blank',
            'title' => 'Internal Server Error',
            'status' => 500,
            'detail' => 'The application failed to start.',
        ],
        JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES,
    );

    exit(1);
}
