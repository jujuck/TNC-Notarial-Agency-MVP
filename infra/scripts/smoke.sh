#!/usr/bin/env bash
#
# Smoke test HTTP du socle API.
# Usage : BASE_URL=http://localhost:8080 bash infra/scripts/smoke.sh
set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

failures=0

fail() {
    echo "FAIL  $1"
    failures=$((failures + 1))
}

pass() {
    echo "OK    $1"
}

request() {
    local method="$1"
    local path="$2"
    local name="$3"
    local code

    code=$(curl -sS -X "$method" \
        -D "$TMP_DIR/$name.headers" \
        -o "$TMP_DIR/$name.body" \
        -w '%{http_code}' \
        "$BASE_URL$path" 2>/dev/null) || code='000'

    echo "$code"
}

header() {
    local name="$1"
    local file="$2"

    grep -i "^${name}:" "$file" | tail -n 1 | cut -d: -f2- | sed 's/^ *//' | tr -d '\r'
}

check_status() {
    local label="$1"
    local actual="$2"
    local expected="$3"

    if [[ "$actual" == "$expected" ]]; then
        pass "$label ($actual)"
    else
        fail "$label (attendu $expected, recu $actual)"
    fi
}

# Liveness
status="$(request GET /api/v1/health health)"
check_status 'GET /api/v1/health' "$status" '200'

if grep -q '"status":"ok"' "$TMP_DIR/health.body" 2>/dev/null; then
    pass 'health body'
else
    fail 'health body ne contient pas {"status":"ok"}'
fi

if [[ "$(header 'content-type' "$TMP_DIR/health.headers")" == application/json* ]]; then
    pass 'health content-type'
else
    fail 'health content-type inattendu'
fi

if [[ -n "$(header 'x-request-id' "$TMP_DIR/health.headers")" ]]; then
    pass 'X-Request-Id present'
else
    fail 'X-Request-Id absent'
fi

# En-tetes de securite
for expected in \
    'x-content-type-options|nosniff' \
    'referrer-policy|no-referrer' \
    'x-frame-options|DENY' \
    'x-robots-tag|noindex, nofollow'; do
    name="${expected%%|*}"
    value="${expected#*|}"
    actual="$(header "$name" "$TMP_DIR/health.headers")"

    if [[ "$actual" == "$value" ]]; then
        pass "header $name"
    else
        fail "header $name (attendu '$value', recu '$actual')"
    fi
done

if [[ -n "$(header 'access-control-allow-origin' "$TMP_DIR/health.headers")" ]]; then
    fail 'CORS permissif detecte'
else
    pass 'pas de CORS permissif'
fi

# Readiness
status="$(request GET /api/v1/health/ready ready)"
check_status 'GET /api/v1/health/ready' "$status" '200'

if grep -q '"database":"ok"' "$TMP_DIR/ready.body" 2>/dev/null; then
    pass 'readiness database ok'
else
    fail 'readiness database non ok'
fi

# Route inconnue
status="$(request GET /api/v1/unknown notfound)"
check_status 'GET /api/v1/unknown' "$status" '404'

if [[ "$(header 'content-type' "$TMP_DIR/notfound.headers")" == application/problem+json* ]]; then
    pass '404 problem+json'
else
    fail '404 content-type inattendu'
fi

if grep -q '"request_id"' "$TMP_DIR/notfound.body" 2>/dev/null; then
    pass '404 request_id present'
else
    fail '404 request_id absent'
fi

# Methode non supportee
status="$(request POST /api/v1/health method)"
check_status 'POST /api/v1/health' "$status" '405'

if [[ "$(header 'content-type' "$TMP_DIR/method.headers")" == application/problem+json* ]]; then
    pass '405 problem+json'
else
    fail '405 content-type inattendu'
fi

# Routes hors perimetre
status="$(request GET /api/v1/ads scope-ads)"
check_status 'GET /api/v1/ads (hors perimetre)' "$status" '404'

status="$(request POST /api/v1/auth/login scope-login)"
check_status 'POST /api/v1/auth/login (hors perimetre)' "$status" '404'

echo
if [[ "$failures" -gt 0 ]]; then
    echo "$failures verification(s) en echec."
    exit 1
fi

echo "Toutes les verifications sont passees."
