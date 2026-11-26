<?php

declare(strict_types=1);

namespace Tests\Shared;

use App\Shared\Exception\ConfigurationException;
use App\Shared\Settings;
use PHPUnit\Framework\TestCase;

final class SettingsTest extends TestCase
{
    /**
     * @param array<string, string> $values
     *
     * @return callable(string): (string|false)
     */
    private static function environment(array $values): callable
    {
        return static fn(string $name): string|false => $values[$name] ?? false;
    }

    /**
     * @return array<string, string>
     */
    private static function validEnvironment(): array
    {
        return [
            'DB_HOST' => 'db',
            'DB_PORT' => '3306',
            'DB_NAME' => 'notarial',
            'DB_USER' => 'notarial',
            'DB_PASSWORD' => 'secret',
            'JWT_SECRET' => str_repeat('a', 32),
        ];
    }

    public function testReadsValidConfiguration(): void
    {
        $settings = Settings::fromEnvironment(self::environment(self::validEnvironment()));

        self::assertSame('development', $settings->appEnv);
        self::assertFalse($settings->appDebug);
        self::assertSame(3306, $settings->dbPort);
        self::assertSame(28800, $settings->jwtTtl);
    }

    public function testMissingRequiredVariableFailsWithoutLeakingValue(): void
    {
        $environment = self::validEnvironment();
        unset($environment['DB_HOST']);

        try {
            Settings::fromEnvironment(self::environment($environment));
            self::fail('A missing variable must fail.');
        } catch (ConfigurationException $exception) {
            self::assertStringContainsString('DB_HOST', $exception->getMessage());
            self::assertStringNotContainsString('secret', $exception->getMessage());
        }
    }

    public function testProductionDebugIsRejected(): void
    {
        $environment = self::validEnvironment() + [
            'APP_ENV' => 'production',
            'APP_DEBUG' => 'true',
        ];

        $this->expectException(ConfigurationException::class);
        $this->expectExceptionMessage('APP_DEBUG must be false');

        Settings::fromEnvironment(self::environment($environment));
    }

    public function testShortJwtSecretIsRejected(): void
    {
        $environment = self::validEnvironment();
        $environment['JWT_SECRET'] = 'too-short';

        $this->expectException(ConfigurationException::class);
        $this->expectExceptionMessage('JWT_SECRET must be at least 32 characters');

        Settings::fromEnvironment(self::environment($environment));
    }

    public function testInvalidDbPortIsRejected(): void
    {
        $environment = self::validEnvironment();
        $environment['DB_PORT'] = 'not-a-port';

        $this->expectException(ConfigurationException::class);
        $this->expectExceptionMessage('DB_PORT');

        Settings::fromEnvironment(self::environment($environment));
    }
}
