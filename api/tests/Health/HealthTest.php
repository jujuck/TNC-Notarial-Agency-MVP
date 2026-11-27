<?php

declare(strict_types=1);

namespace Tests\Health;

use App\Shared\DatabaseProbe;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Slim\App;
use Slim\Psr7\Factory\ServerRequestFactory;
use Tests\Support\FakeDatabaseProbe;
use Tests\Support\TestApp;

final class HealthTest extends TestCase
{
    public function testLiveness(): void
    {
        $response = TestApp::create()->handle(
            (new ServerRequestFactory())->createServerRequest('GET', '/api/v1/health'),
        );

        self::assertSame(200, $response->getStatusCode());
        self::assertSame('application/json; charset=utf-8', $response->getHeaderLine('Content-Type'));
        self::assertSame(['status' => 'ok'], $this->body($response));
    }

    public function testReadinessWithDatabaseAvailable(): void
    {
        $response = $this->appWithDatabase(true)->handle(
            (new ServerRequestFactory())->createServerRequest('GET', '/api/v1/health/ready'),
        );

        self::assertSame(200, $response->getStatusCode());
        self::assertSame(
            ['status' => 'ok', 'checks' => ['database' => 'ok']],
            $this->body($response),
        );
    }

    public function testReadinessWithDatabaseUnavailable(): void
    {
        $response = $this->appWithDatabase(false)->handle(
            (new ServerRequestFactory())->createServerRequest('GET', '/api/v1/health/ready'),
        );

        self::assertSame(503, $response->getStatusCode());
        self::assertSame(
            ['status' => 'unavailable', 'checks' => ['database' => 'error']],
            $this->body($response),
        );
    }

    /**
     * @return App<\DI\Container>
     */
    private function appWithDatabase(bool $available): App
    {
        return TestApp::create([DatabaseProbe::class => new FakeDatabaseProbe($available)]);
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
