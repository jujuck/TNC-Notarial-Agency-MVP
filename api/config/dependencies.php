<?php

declare(strict_types=1);

use App\Auth\JwtService;
use App\Shared\Database;
use App\Shared\DatabaseProbe;
use App\Shared\Logging\LoggerFactory;
use App\Shared\Settings;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Log\LoggerInterface;
use Slim\Psr7\Factory\ResponseFactory;

return [
    LoggerInterface::class => static fn(Settings $settings): LoggerInterface => LoggerFactory::create($settings),
    Database::class => static fn(Settings $settings): Database => new Database($settings),
    DatabaseProbe::class => static fn(Database $database): DatabaseProbe => $database,
    JwtService::class => static fn(Settings $settings): JwtService => new JwtService(
        $settings->jwtSecret,
        $settings->appUrl,
        $settings->jwtTtl,
    ),
    ResponseFactoryInterface::class => static fn(): ResponseFactoryInterface => new ResponseFactory(),
];
