<?php

declare(strict_types=1);

namespace App\Auth;

use App\Shared\ProblemDetails;
use App\Shared\RequestIdMiddleware;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Throwable;

/**
 * Template d'authentification par cookie JWT.
 *
 * Non branche a une route dans ce change : le change d'authentification
 * ajoutera la route de login et protegera les routes du back-office.
 */
final class AuthMiddleware implements MiddlewareInterface
{
    public const COOKIE_NAME = 'auth_token';
    public const ADMIN_ATTRIBUTE = 'admin';

    public function __construct(
        private readonly JwtService $jwtService,
        private readonly ResponseFactoryInterface $responseFactory,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $token = $this->token($request);

        if ($token === null) {
            return $this->unauthorized($request);
        }

        try {
            $claims = $this->jwtService->verify($token);
        } catch (Throwable) {
            return $this->unauthorized($request);
        }

        if (!isset($claims['sub'], $claims['role'])) {
            return $this->unauthorized($request);
        }

        $admin = [
            'id' => (string) $claims['sub'],
            'role' => (string) $claims['role'],
        ];

        return $handler->handle($request->withAttribute(self::ADMIN_ATTRIBUTE, $admin));
    }

    private function token(ServerRequestInterface $request): ?string
    {
        $token = $request->getCookieParams()[self::COOKIE_NAME] ?? null;

        return is_string($token) && $token !== '' ? $token : null;
    }

    private function unauthorized(ServerRequestInterface $request): ResponseInterface
    {
        $requestId = $request->getAttribute(RequestIdMiddleware::ATTRIBUTE);

        return ProblemDetails::response(
            $this->responseFactory->createResponse(401),
            401,
            'Unauthorized',
            'Authentication is required.',
            $request->getUri()->getPath(),
            is_string($requestId) ? $requestId : null,
        );
    }
}
