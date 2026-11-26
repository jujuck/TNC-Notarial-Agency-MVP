<?php

declare(strict_types=1);

use App\Shared\ErrorMiddleware;
use App\Shared\LoggingMiddleware;
use App\Shared\RequestIdMiddleware;
use App\Shared\Settings;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Log\LoggerInterface;
use Slim\App;

/**
 * Ordre des middlewares (du plus externe au plus interne) :
 * RequestId -> Logging -> Error -> Routing -> action.
 *
 * @param App<\Psr\Container\ContainerInterface> $app
 *
 * @return App<\Psr\Container\ContainerInterface>
 */
return static function (App $app): App {
    $container = $app->getContainer();

    if ($container === null) {
        throw new RuntimeException('The DI container is required to register middleware.');
    }

    /** @var LoggerInterface $logger */
    $logger = $container->get(LoggerInterface::class);

    /** @var ResponseFactoryInterface $responseFactory */
    $responseFactory = $container->get(ResponseFactoryInterface::class);

    /** @var Settings $settings */
    $settings = $container->get(Settings::class);

    $app->addRoutingMiddleware();

    $app->add(new ErrorMiddleware($logger, $responseFactory, $settings->appDebug));
    $app->add(new LoggingMiddleware($logger));
    $app->add(new RequestIdMiddleware());

    return $app;
};
