<?php

declare(strict_types=1);

namespace Tests\Auth;

use App\Auth\JwtService;
use Firebase\JWT\JWT;
use PHPUnit\Framework\TestCase;
use UnexpectedValueException;

final class JwtServiceTest extends TestCase
{
    private const SECRET = 'a-very-long-test-secret-with-32-chars';
    private const ISSUER = 'http://localhost';

    public function testIssuesAndVerifiesToken(): void
    {
        $service = new JwtService(self::SECRET, self::ISSUER);

        $token = $service->issue('admin@example.test', 'admin');
        $claims = $service->verify($token);

        $issuedAt = $claims['iat'] ?? null;
        $expiresAt = $claims['exp'] ?? null;

        self::assertSame(self::ISSUER, $claims['iss'] ?? null);
        self::assertSame('admin@example.test', $claims['sub'] ?? null);
        self::assertSame('admin', $claims['role'] ?? null);
        self::assertIsInt($issuedAt);
        self::assertIsInt($expiresAt);
        self::assertSame(28800, $expiresAt - $issuedAt);
    }

    public function testRejectsExpiredToken(): void
    {
        $service = new JwtService(self::SECRET, self::ISSUER);

        $token = JWT::encode(
            [
                'iss' => self::ISSUER,
                'sub' => 'admin@example.test',
                'role' => 'admin',
                'iat' => time() - 100,
                'exp' => time() - 10,
            ],
            self::SECRET,
            'HS256',
        );

        $this->expectException(UnexpectedValueException::class);

        $service->verify($token);
    }

    public function testRejectsInvalidSignature(): void
    {
        $service = new JwtService(self::SECRET, self::ISSUER);

        $token = JWT::encode(
            [
                'iss' => self::ISSUER,
                'sub' => 'admin@example.test',
                'role' => 'admin',
                'iat' => time(),
                'exp' => time() + 60,
            ],
            'another-secret-with-at-least-32-chars!!',
            'HS256',
        );

        $this->expectException(UnexpectedValueException::class);

        $service->verify($token);
    }

    public function testRejectsWrongIssuer(): void
    {
        $service = new JwtService(self::SECRET, self::ISSUER);

        $token = JWT::encode(
            [
                'iss' => 'https://evil.example',
                'sub' => 'admin@example.test',
                'role' => 'admin',
                'iat' => time(),
                'exp' => time() + 60,
            ],
            self::SECRET,
            'HS256',
        );

        $this->expectException(UnexpectedValueException::class);

        $service->verify($token);
    }
}
