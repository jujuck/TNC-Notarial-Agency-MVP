<?php

declare(strict_types=1);

namespace App\Health;

use App\Shared\DatabaseProbe;
use App\Shared\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final class ReadyAction
{
    public function __construct(private readonly DatabaseProbe $database) {}

    public function __invoke(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $databaseOk = $this->database->ping();

        return JsonResponse::create(
            $response,
            [
                'status' => $databaseOk ? 'ok' : 'unavailable',
                'checks' => ['database' => $databaseOk ? 'ok' : 'error'],
            ],
            $databaseOk ? 200 : 503,
        );
    }
}
