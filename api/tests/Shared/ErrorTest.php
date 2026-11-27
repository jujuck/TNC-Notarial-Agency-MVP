<?php

declare(strict_types=1);

namespace Tests\Shared;

use App\Shared\ErrorMiddleware;
use App\Shared\RequestIdMiddleware;
use Monolog\Handler\NullHandler;
use Monolog\Logger;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use RuntimeException;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Psr7\Factory\ServerRequestFactory;
use Tests\Support\TestApp;

final class ErrorTest extends TestCase
{
    public function testUnknownRouteReturnsProblemDetails(): void
    {
        $response = TestApp::create()->handle(
            (new ServerRequestFactory())->createServerRequest('GET', '/api/v1/unknown'),
        );

        self::assertSame(404, $response->getStatusCode());
        self::assertStringContainsString('application/problem+json', $response->getHeaderLine('Content-Type'));

        $body = $this->body($response);
        self::assertSame(404, $body['status'] ?? null);
        self::assertArrayHasKey('title', $body);
        self::assertSame('/api/v1/unknown', $body['instance'] ?? null);
        self::assertNotEmpty($body['request_id'] ?? null);
    }

    public function testUnsupportedMethodReturnsProblemDetails(): void
    {
        $response = TestApp::create()->handle(
            (new ServerRequestFactory())->createServerRequest('POST', '/api/v1/health'),
        );

        self::assertSame(405, $response->getStatusCode());
        self::assertStringContainsString('application/problem+json', $response->getHeaderLine('Content-Type'));

        $body = $this->body($response);
        self::assertSame(405, $body['status'] ?? null);
        self::assertSame('GET', $response->getHeaderLine('Allow'));
    }

    public function testInternalErrorHidesDetailsInProduction(): void
    {
        $middleware = new ErrorMiddleware(
            new Logger('test', [new NullHandler()]),
            new ResponseFactory(),
            false,
        );

        $request = (new ServerRequestFactory())
            ->createServerRequest('GET', '/api/v1/boom')
            ->withAttribute(RequestIdMiddleware::ATTRIBUTE, 'request-id');

        $handler = new class implements RequestHandlerInterface {
            public function handle(ServerRequestInterface $request): ResponseInterface
            {
                throw new RuntimeException('database password leaked');
            }
        };

        $response = $middleware->process($request, $handler);

        self::assertSame(500, $response->getStatusCode());
        self::assertStringContainsString('application/problem+json', $response->getHeaderLine('Content-Type'));

        $body = $this->body($response);
        self::assertSame(500, $body['status'] ?? null);
        self::assertSame('An unexpected error occurred.', $body['detail'] ?? null);
        self::assertSame('request-id', $body['request_id'] ?? null);
        self::assertStringNotContainsString('database password leaked', (string) $response->getBody());
    }

    /**
     * @return array<string, mixed>
     */
    private function body(ResponseInterface $response): array
    {
        /** @var array<string, mixed> $body */
        $body = json_decode((string) $response->getBody(), true, 512, JSON_THROW_ON_ERROR);

        return $body;
    }
}
