<?php

declare(strict_types=1);

namespace Tests\Support;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Factory\ResponseFactory;

final class RecordingHandler implements RequestHandlerInterface
{
    public ?ServerRequestInterface $request = null;

    public function __construct(private readonly int $status = 200) {}

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $this->request = $request;

        return (new ResponseFactory())->createResponse($this->status);
    }
}
