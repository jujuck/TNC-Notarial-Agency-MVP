<?php

declare(strict_types=1);

namespace App\Shared;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerInterface;
use Slim\Exception\HttpMethodNotAllowedException;
use Slim\Exception\HttpNotFoundException;
use Throwable;

/**
 * Convertit toute exception en Problem Details.
 *
 * En production, aucune trace ni message interne n'est expose au client : le
 * detail complet part dans les logs structures.
 */
final class ErrorMiddleware implements MiddlewareInterface
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly ResponseFactoryInterface $responseFactory,
        private readonly bool $debug,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        try {
            return $handler->handle($request);
        } catch (HttpNotFoundException) {
            return $this->problem($request, 404, 'Not Found', 'The requested resource was not found.');
        } catch (HttpMethodNotAllowedException $exception) {
            $response = $this->problem(
                $request,
                405,
                'Method Not Allowed',
                'The HTTP method is not supported for this resource.',
            );

            return $response->withHeader('Allow', implode(', ', $exception->getAllowedMethods()));
        } catch (Throwable $exception) {
            $this->logger->error(
                'Unhandled exception',
                [
                    'request_id' => $this->requestId($request),
                    'exception' => $exception,
                ],
            );

            $detail = $this->debug
                ? $exception->getMessage()
                : 'An unexpected error occurred.';

            return $this->problem($request, 500, 'Internal Server Error', $detail);
        }
    }

    private function problem(
        ServerRequestInterface $request,
        int $status,
        string $title,
        string $detail,
    ): ResponseInterface {
        return ProblemDetails::response(
            $this->responseFactory->createResponse($status),
            $status,
            $title,
            $detail,
            $request->getUri()->getPath(),
            $this->requestId($request),
        );
    }

    private function requestId(ServerRequestInterface $request): ?string
    {
        $requestId = $request->getAttribute(RequestIdMiddleware::ATTRIBUTE);

        return is_string($requestId) ? $requestId : null;
    }
}
