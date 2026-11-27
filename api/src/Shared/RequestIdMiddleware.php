<?php

declare(strict_types=1);

namespace App\Shared;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/**
 * Genere un identifiant unique par requete, l'expose en attribut et en en-tete.
 */
final class RequestIdMiddleware implements MiddlewareInterface
{
    public const ATTRIBUTE = 'request_id';
    public const HEADER = 'X-Request-Id';

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $requestId = $this->generate();

        $response = $handler->handle($request->withAttribute(self::ATTRIBUTE, $requestId));

        return $response->withHeader(self::HEADER, $requestId);
    }

    private function generate(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0F) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3F) | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
    }
}
