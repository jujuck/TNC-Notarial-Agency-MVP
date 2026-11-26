<?php

declare(strict_types=1);

use App\Shared\Settings;
use DI\ContainerBuilder;
use Slim\App;
use Slim\Factory\AppFactory;

/** @var Settings $settings */
$settings = require __DIR__ . '/settings.php';

$builder = new ContainerBuilder();
$builder->addDefinitions(__DIR__ . '/dependencies.php');
$builder->addDefinitions([Settings::class => $settings]);

$container = $builder->build();

/** @var App<\Psr\Container\ContainerInterface> $app */
$app = AppFactory::createFromContainer($container);

/** @var callable(App<\Psr\Container\ContainerInterface>): App<\Psr\Container\ContainerInterface> $middleware */
$middleware = require __DIR__ . '/middleware.php';
$app = $middleware($app);

/** @var callable(App<\Psr\Container\ContainerInterface>): void $routes */
$routes = require __DIR__ . '/routes.php';
$routes($app);

return $app;
