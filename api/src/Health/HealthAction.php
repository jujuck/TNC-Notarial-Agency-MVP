<?php

declare(strict_types=1);

namespace App\Health;

use App\Shared\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final class HealthAction
{
    public function __invoke(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        return JsonResponse::create($response, ['status' => 'ok']);
    }
}
