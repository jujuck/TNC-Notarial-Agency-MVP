<?php

declare(strict_types=1);

namespace App\Shared\Exception;

use RuntimeException;

/**
 * Configuration invalide ou incomplete.
 *
 * Le message ne contient jamais la valeur d'une variable, uniquement son nom.
 */
final class ConfigurationException extends RuntimeException {}
