<?php

declare(strict_types=1);

namespace App\Shared;

use App\Shared\Exception\ConfigurationException;

/**
 * Configuration applicative, lue depuis les variables d'environnement.
 *
 * La validation est fail-fast : toute valeur manquante ou invalide empeche le
 * demarrage. Les messages d'erreur ne contiennent jamais les valeurs sensibles.
 */
final readonly class Settings
{
    public const ENVIRONMENTS = ['development', 'test', 'production'];

    private const REQUIRED_VARIABLES = [
        'DB_HOST',
        'DB_PORT',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'JWT_SECRET',
    ];

    private const JWT_MIN_SECRET_LENGTH = 32;

    public function __construct(
        public string $appEnv,
        public bool $appDebug,
        public string $appUrl,
        public string $dbHost,
        public int $dbPort,
        public string $dbName,
        public string $dbUser,
        public string $dbPassword,
        public string $jwtSecret,
        public int $jwtTtl,
    ) {}

    /**
     * @param (callable(string): (string|false))|null $getenv
     *
     * @throws ConfigurationException
     */
    public static function fromEnvironment(?callable $getenv = null): self
    {
        $getenv ??= static fn(string $name): string|false => getenv($name);

        /** @var callable(string): (string|false) $getenv */
        $appEnv = self::read($getenv, 'APP_ENV') ?? 'development';
        if (!in_array($appEnv, self::ENVIRONMENTS, true)) {
            throw new ConfigurationException(
                sprintf(
                    'APP_ENV must be one of: %s.',
                    implode(', ', self::ENVIRONMENTS),
                ),
            );
        }

        $appDebug = self::readBoolean($getenv, 'APP_DEBUG', false);

        if ($appEnv === 'production' && $appDebug) {
            throw new ConfigurationException('APP_DEBUG must be false when APP_ENV=production.');
        }

        foreach (self::REQUIRED_VARIABLES as $name) {
            if (self::read($getenv, $name) === null) {
                throw new ConfigurationException(sprintf('Missing required environment variable: %s.', $name));
            }
        }

        $dbPort = self::read($getenv, 'DB_PORT') ?? '';
        if (!ctype_digit($dbPort) || (int) $dbPort < 1 || (int) $dbPort > 65535) {
            throw new ConfigurationException('DB_PORT must be an integer between 1 and 65535.');
        }

        $jwtSecret = self::read($getenv, 'JWT_SECRET') ?? '';
        if (strlen($jwtSecret) < self::JWT_MIN_SECRET_LENGTH) {
            throw new ConfigurationException(
                sprintf(
                    'JWT_SECRET must be at least %d characters.',
                    self::JWT_MIN_SECRET_LENGTH,
                ),
            );
        }

        $jwtTtl = self::read($getenv, 'JWT_TTL') ?? '28800';
        if (!ctype_digit($jwtTtl) || (int) $jwtTtl < 1) {
            throw new ConfigurationException('JWT_TTL must be a positive integer (seconds).');
        }

        return new self(
            appEnv: $appEnv,
            appDebug: $appDebug,
            appUrl: self::read($getenv, 'APP_URL') ?? 'http://localhost:8080',
            dbHost: self::read($getenv, 'DB_HOST') ?? '',
            dbPort: (int) $dbPort,
            dbName: self::read($getenv, 'DB_NAME') ?? '',
            dbUser: self::read($getenv, 'DB_USER') ?? '',
            dbPassword: self::read($getenv, 'DB_PASSWORD') ?? '',
            jwtSecret: $jwtSecret,
            jwtTtl: (int) $jwtTtl,
        );
    }

    /**
     * @param callable(string): (string|false) $getenv
     */
    private static function read(callable $getenv, string $name): ?string
    {
        $value = $getenv($name);

        return is_string($value) && $value !== '' ? $value : null;
    }

    /**
     * @param callable(string): (string|false) $getenv
     */
    private static function readBoolean(callable $getenv, string $name, bool $default): bool
    {
        $value = self::read($getenv, $name);

        if ($value === null) {
            return $default;
        }

        return match (strtolower($value)) {
            '1', 'true', 'yes', 'on' => true,
            '0', 'false', 'no', 'off' => false,
            default => throw new ConfigurationException(
                sprintf(
                    '%s must be a boolean (true/false).',
                    $name,
                ),
            ),
        };
    }
}
