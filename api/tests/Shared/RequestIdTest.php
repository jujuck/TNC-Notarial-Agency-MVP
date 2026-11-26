<?php

declare(strict_types=1);

namespace Tests\Shared;

use App\Shared\RequestIdMiddleware;
use Monolog\Handler\TestHandler;
use Monolog\Logger;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Slim\Psr7\Factory\ServerRequestFactory;
use Tests\Support\TestApp;

final class RequestIdTest extends TestCase
{
    public function testResponseContainsRequestId(): void
    {
        $response = TestApp::create()->handle(
            (new ServerRequestFactory())->createServerRequest('GET', '/api/v1/health'),
        );

        self::assertNotSame('', $response->getHeaderLine(RequestIdMiddleware::HEADER));
    }

    public function testLogsAreCorrelatedWithRequestId(): void
    {
        $records = new TestHandler();
        $logger = new Logger('test', [$records]);

        $app = TestApp::create([
            LoggerInterface::class => $logger,
        ]);

        $response = $app->handle(
            (new ServerRequestFactory())->createServerRequest('GET', '/api/v1/health'),
        );

        $requestId = $response->getHeaderLine(RequestIdMiddleware::HEADER);
        self::assertNotSame('', $requestId);

        $handled = $records->getRecords();
        self::assertCount(1, $handled);

        $record = array_shift($handled);
        if ($record === null) {
            self::fail('Expected one log record.');
        }

        self::assertSame($requestId, $record->context['request_id'] ?? null);
        self::assertSame('GET', $record->context['method'] ?? null);
        self::assertSame('/api/v1/health', $record->context['path'] ?? null);
        self::assertSame(200, $record->context['status'] ?? null);
        self::assertArrayHasKey('duration_ms', $record->context);
    }
}
