<?php

declare(strict_types=1);

namespace App\Auth;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use UnexpectedValueException;

/**
 * Template JWT HS256.
 *
 * Aucune route n'emet encore de token : ce service sera branche par le change
 * d'authentification du back-office.
 */
final class JwtService
{
    private const ALGORITHM = 'HS256';

    public function __construct(
        private readonly string $secret,
        private readonly string $issuer,
        private readonly int $ttl = 28800,
    ) {}

    public function issue(string $subject, string $role): string
    {
        $now = time();

        return JWT::encode(
            [
                'iss' => $this->issuer,
                'sub' => $subject,
                'role' => $role,
                'iat' => $now,
                'exp' => $now + $this->ttl,
            ],
            $this->secret,
            self::ALGORITHM,
        );
    }

    /**
     * @return array<string, mixed>
     *
     * @throws UnexpectedValueException
     */
    public function verify(string $token): array
    {
        /** @var array<string, mixed> $claims */
        $claims = (array) JWT::decode($token, new Key($this->secret, self::ALGORITHM));

        if (($claims['iss'] ?? null) !== $this->issuer) {
            throw new UnexpectedValueException('Invalid token issuer.');
        }

        return $claims;
    }
}
