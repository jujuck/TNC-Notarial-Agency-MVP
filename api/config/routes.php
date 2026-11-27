<?php

declare(strict_types=1);

use Slim\App;
use Slim\Routing\RouteCollectorProxy;

/**
 * Slim lie les closures de routage au conteneur : elles ne peuvent donc pas
 * etre declarees `static` (PHP interdit de lier une instance a une closure
 * statique), d'ou l'absence de `static` sur la closure de groupe.
 *
 * @param App<\Psr\Container\ContainerInterface> $app
 */
return static function (App $app): void {
    $app->group(
        '/api/v1',
        function (RouteCollectorProxy $group): void {
            /** @var callable(RouteCollectorProxy): void $healthRoutes */
            $healthRoutes = require __DIR__ . '/../src/Health/routes.php';
            $healthRoutes($group);
        },
    );
};
