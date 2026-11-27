<?php

declare(strict_types=1);

namespace Tests\Auth;

use App\Auth\AuthMiddleware;
use App\Auth\JwtService;
use App\Shared\RequestIdMiddleware;
use PHPUnit\Framework\TestCase;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Psr7\Factory\ServerRequestFactory;
use Tests\Support\RecordingHandler;
use Tests\Support\TestApp;

final class AuthMiddlewareTest extends TestCase
{
    private const SECRET = 'a-very-long-test-secret-with-32-chars';

    public function testRejectsRequestWithoutCookie(): void
    {
        $middleware = $this->middleware();

        $response = $middleware->process(
            (new ServerRequestFactory())
                ->createServerRequest('GET', '/api/v1/admin/ads')
                ->withAttribute(RequestIdMiddleware::ATTRIBUTE, 'request-id'),
            new RecordingHandler(),
        );

        self::assertSame(401, $response->getStatusCode());
        self::assertStringContainsString('application/problem+json', $response->getHeaderLine('Content-Type'));
        self::assertStringContainsString('"request_id":"request-id"', (string) $response->getBody());
    }

    public function testRejectsInvalidToken(): void
    {
        $middleware = $this->middleware();

        $request = (new ServerRequestFactory())
            ->createServerRequest('GET', '/api/v1/admin/ads')
            ->withCookieParams([AuthMiddleware::COOKIE_NAME => 'not-a-jwt']);

        $response = $middleware->process($request, new RecordingHandler());

        self::assertSame(401, $response->getStatusCode());
    }

    public function testAttachesAdminForValidToken(): void
    {
        $middleware = $this->middleware();
        $token = (new JwtService(self::SECRET, 'http://localhost'))->issue('admin@example.test', 'admin');

        $handler = new RecordingHandler();
        $request = (new ServerRequestFactory())
            ->createServerRequest('GET', '/api/v1/admin/ads')
            ->withCookieParams([AuthMiddleware::COOKIE_NAME => $token]);

        $response = $middleware->process($request, $handler);

        self::assertSame(200, $response->getStatusCode());

        $handledRequest = $handler->request;
        self::assertNotNull($handledRequest);
        self::assertSame(
            ['id' => 'admin@example.test', 'role' => 'admin'],
            $handledRequest->getAttribute(AuthMiddleware::ADMIN_ATTRIBUTE),
        );
    }

    private function middleware(): AuthMiddleware
    {
        return new AuthMiddleware(
            new JwtService(self::SECRET, 'http://localhost'),
            new ResponseFactory(),
        );
    }

    public function testLoginRouteIsNotWired(): void
    {
        $response = TestApp::create()->handle(
            (new ServerRequestFactory())->createServerRequest('POST', '/api/v1/auth/login'),
        );

        self::assertSame(404, $response->getStatusCode());
    }
}
