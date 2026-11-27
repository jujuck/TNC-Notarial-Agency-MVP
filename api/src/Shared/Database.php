<?php

declare(strict_types=1);

namespace App\Shared;

use PDO;
use Throwable;

/**
 * Connexion MySQL a la demande.
 *
 * Aucune table ni migration dans ce change : la readiness se limite a un
 * SELECT 1.
 */
final class Database implements DatabaseProbe
{
    public function __construct(private readonly Settings $settings) {}

    public function ping(): bool
    {
        try {
            $this->connection()->query('SELECT 1');

            return true;
        } catch (Throwable) {
            return false;
        }
    }

    public function connection(): PDO
    {
        return new PDO(
            sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
                $this->settings->dbHost,
                $this->settings->dbPort,
                $this->settings->dbName,
            ),
            $this->settings->dbUser,
            $this->settings->dbPassword,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 2,
            ],
        );
    }
}
