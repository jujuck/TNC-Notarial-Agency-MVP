<?php

declare(strict_types=1);

namespace Tests\Support;

use App\Shared\DatabaseProbe;

final class FakeDatabaseProbe implements DatabaseProbe
{
    public function __construct(private readonly bool $available) {}

    public function ping(): bool
    {
        return $this->available;
    }
}
