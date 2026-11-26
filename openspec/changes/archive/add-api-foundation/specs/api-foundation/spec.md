# Spec Delta

## Purpose

Fournir le socle HTTP/JSON de l'API Slim : routage versionné, santé, erreurs normalisées, configuration, logs et runtime Docker.

## ADDED Requirements

### Requirement: Versioned API routing

The API SHALL expose all endpoints under `/api/v1` and SHALL return JSON for every response.

#### Scenario: Health endpoint is reachable

- **WHEN** a client sends `GET /api/v1/health`
- **THEN** the API responds `200` with `Content-Type: application/json`

#### Scenario: Unknown route

- **WHEN** a client requests an unknown path under `/api/v1`
- **THEN** the API responds `404` with `Content-Type: application/problem+json`

#### Scenario: Unsupported method

- **WHEN** a client uses an unsupported HTTP method on an existing route
- **THEN** the API responds `405` with `Content-Type: application/problem+json`

### Requirement: Health endpoints

The API SHALL provide a liveness endpoint and a readiness endpoint without exposing sensitive configuration.

#### Scenario: Liveness

- **WHEN** `GET /api/v1/health` is called
- **THEN** the API responds `200` with `{"status":"ok"}`

#### Scenario: Readiness with database available

- **WHEN** `GET /api/v1/health/ready` is called and MySQL accepts a query
- **THEN** the API responds `200` with `{"status":"ok","checks":{"database":"ok"}}`

#### Scenario: Readiness with database unavailable

- **WHEN** `GET /api/v1/health/ready` is called and MySQL is unreachable
- **THEN** the API responds `503` with `{"status":"unavailable","checks":{"database":"error"}}`

### Requirement: Problem Details errors

The API SHALL return errors as RFC 9457 Problem Details with `type`, `title`, `status`, `detail`, `instance` and `request_id`, and MUST NOT expose stack traces or internal messages in production.

#### Scenario: Not found

- **WHEN** a client requests a route that does not exist
- **THEN** the response body contains `status: 404`, `title`, `instance` and `request_id`

#### Scenario: Internal error

- **WHEN** an unhandled exception occurs in production
- **THEN** the API responds `500` with a generic `detail` and no stack trace

### Requirement: Request correlation

The API SHALL generate a unique identifier for every request, return it in the `X-Request-Id` response header and include it in structured logs.

#### Scenario: Request ID is returned

- **WHEN** a client sends any request
- **THEN** the response includes a non-empty `X-Request-Id` header

#### Scenario: Logs are correlated

- **WHEN** a request is handled
- **THEN** the emitted log entry contains the same `request_id`, the HTTP method, path, status and duration

### Requirement: Fail-fast configuration

The API SHALL read configuration from environment variables, validate required values at startup and refuse to start when a required value is missing or invalid.

#### Scenario: Missing required variable

- **WHEN** the API starts without a required database variable
- **THEN** the process exits with a non-zero status and logs the missing variable name without its value

#### Scenario: Production debug disabled

- **WHEN** `APP_ENV=production` and `APP_DEBUG=true`
- **THEN** the API refuses to start and logs a configuration error

### Requirement: Security headers

The API responses SHALL include `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY` and `X-Robots-Tag: noindex, nofollow`.

#### Scenario: Headers on health response

- **WHEN** a client requests `GET /api/v1/health` through Nginx
- **THEN** the response contains the four security headers

#### Scenario: No permissive CORS

- **WHEN** a client sends a request to the API
- **THEN** the response does not contain `Access-Control-Allow-Origin: *`

### Requirement: Containerized runtime

The API SHALL run under Docker Compose with Nginx, PHP-FPM and MySQL, and SHALL be reachable only through Nginx.

#### Scenario: Development startup

- **WHEN** `docker compose up` is run in development
- **THEN** Nginx, PHP-FPM and MySQL start, and `GET /api/v1/health` through Nginx returns `200`

#### Scenario: Database not publicly exposed

- **WHEN** the production Compose configuration is used
- **THEN** MySQL has no published host port
