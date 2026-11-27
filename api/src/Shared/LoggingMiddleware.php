<?php

declare(strict_types=1);

namespace App\Shared;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerInterface;

/**
 * Journalise chaque requete sans corps ni donnee personnelle.
 */
final class LoggingMiddleware implements MiddlewareInterface
{
    public function __construct(private readonly LoggerInterface $logger) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $start = hrtime(true);

        $response = $handler->handle($request);

        $durationMs = (hrtime(true) - $start) / 1_000_000;

        $this->logger->info(
            'request',
            [
                'request_id' => $request->getAttribute(RequestIdMiddleware::ATTRIBUTE),
                'method' => $request->getMethod(),
                'path' => $request->getUri()->getPath(),
                'status' => $response->getStatusCode(),
                'duration_ms' => round($durationMs, 2),
            ],
        );

        return $response;
    }
}
