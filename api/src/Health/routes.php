<?php

declare(strict_types=1);

use App\Health\HealthAction;
use App\Health\ReadyAction;
use Slim\Routing\RouteCollectorProxy;

return static function (RouteCollectorProxy $group): void {
    $group->get('/health', HealthAction::class);
    $group->get('/health/ready', ReadyAction::class);
};
