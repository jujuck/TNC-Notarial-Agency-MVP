<?php

declare(strict_types=1);

namespace Tests\Support;

use App\Shared\Settings;
use DI\ContainerBuilder;
use Monolog\Handler\NullHandler;
use Monolog\Logger;
use Psr\Log\LoggerInterface;
use Slim\App;
use Slim\Factory\AppFactory;

final class TestApp
{
    /**
     * @param array<string, mixed> $overrides
     *
     * @return App<\DI\Container>
     */
    public static function create(array $overrides = []): App
    {
        $builder = new ContainerBuilder();
        $builder->addDefinitions(dirname(__DIR__, 2) . '/config/dependencies.php');
        $builder->addDefinitions(
            [
                Settings::class => self::settings(),
                LoggerInterface::class => new Logger('test', [new NullHandler()]),
            ],
        );
        $builder->addDefinitions($overrides);

        $container = $builder->build();

        $app = AppFactory::createFromContainer($container);

        /** @var callable(App<\DI\Container>): App<\DI\Container> $middleware */
        $middleware = require dirname(__DIR__, 2) . '/config/middleware.php';
        $app = $middleware($app);

        /** @var callable(App<\DI\Container>): void $routes */
        $routes = require dirname(__DIR__, 2) . '/config/routes.php';
        $routes($app);

        return $app;
    }

    public static function settings(): Settings
    {
        return new Settings(
            appEnv: 'test',
            appDebug: false,
            appUrl: 'http://localhost',
            dbHost: 'db',
            dbPort: 3306,
            dbName: 'notarial',
            dbUser: 'notarial',
            dbPassword: 'secret',
            jwtSecret: str_repeat('a', 32),
            jwtTtl: 28800,
        );
    }
}
