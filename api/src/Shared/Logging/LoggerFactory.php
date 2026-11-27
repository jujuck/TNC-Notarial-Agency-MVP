<?php

declare(strict_types=1);

namespace App\Shared\Logging;

use App\Shared\Settings;
use Monolog\Formatter\JsonFormatter;
use Monolog\Formatter\LineFormatter;
use Monolog\Handler\StreamHandler;
use Monolog\Level;
use Monolog\Logger;
use Psr\Log\LoggerInterface;

final class LoggerFactory
{
    public static function create(Settings $settings): LoggerInterface
    {
        $handler = new StreamHandler(
            'php://stdout',
            $settings->appDebug ? Level::Debug : Level::Info,
        );

        $handler->setFormatter(
            $settings->appEnv === 'production'
                ? new JsonFormatter()
                : new LineFormatter(null, null, true, true),
        );

        return new Logger('api', [$handler]);
    }
}
