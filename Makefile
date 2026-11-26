SHELL := /bin/bash
.DEFAULT_GOAL := help

COMPOSE ?= docker compose
API_SERVICE ?= api
BASE_URL ?= http://localhost:8080

.PHONY: help new-branch build up down logs sh test stan cs cs-fix smoke

help: ## Affiche les cibles disponibles
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "%-12s %s\n", $$1, $$2}'

new-branch: ## Cree une branche (issue + draft PR)
	@bash .github/create-new-branch-sync.sh

build: ## Construit les images Docker
	$(COMPOSE) build

up: ## Demarre la stack (Nginx, PHP-FPM, MySQL)
	$(COMPOSE) up -d

down: ## Arrete la stack sans supprimer les volumes
	$(COMPOSE) down

logs: ## Suit les logs de la stack
	$(COMPOSE) logs -f

sh: ## Ouvre un shell dans le conteneur API
	$(COMPOSE) exec $(API_SERVICE) sh

test: ## Lance PHPUnit
	$(COMPOSE) run --rm $(API_SERVICE) vendor/bin/phpunit

stan: ## Lance PHPStan (niveau 8)
	$(COMPOSE) run --rm $(API_SERVICE) vendor/bin/phpstan analyse --no-progress

cs: ## Verifie le style sans modifier les fichiers
	$(COMPOSE) run --rm $(API_SERVICE) vendor/bin/php-cs-fixer fix --dry-run --diff

cs-fix: ## Corrige le style
	$(COMPOSE) run --rm $(API_SERVICE) vendor/bin/php-cs-fixer fix

smoke: ## Lance le smoke test HTTP contre BASE_URL
	BASE_URL=$(BASE_URL) bash infra/scripts/smoke.sh
