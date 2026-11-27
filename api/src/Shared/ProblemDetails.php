<?php

declare(strict_types=1);

namespace App\Shared;

use Psr\Http\Message\ResponseInterface;

/**
 * Erreurs au format RFC 9457 (application/problem+json).
 */
final class ProblemDetails
{
    public static function response(
        ResponseInterface $response,
        int $status,
        string $title,
        string $detail,
        ?string $instance = null,
        ?string $requestId = null,
    ): ResponseInterface {
        $body = [
            'type' => 'about:blank',
            'title' => $title,
            'status' => $status,
            'detail' => $detail,
        ];

        if ($instance !== null) {
            $body['instance'] = $instance;
        }

        if ($requestId !== null) {
            $body['request_id'] = $requestId;
        }

        return JsonResponse::create(
            $response,
            $body,
            $status,
            ['Content-Type' => 'application/problem+json; charset=utf-8'],
        );
    }
}
