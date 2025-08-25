.PHONY: bash composer-install create-network deploy help install php-cs-fixer phpstan restart start stop
.DEFAULT_GOAL := help

DOCKER_ROOT=docker exec -t --user root $(shell docker ps --filter name=street-guard_app -q)
DOCKER_ROOT_I=docker exec -ti --user root $(shell docker ps --filter name=street-guard_app -q)
ARGS=10 2
GREEN = \033[32m
YELLOW = \033[33m
BLUE = \033[34m
RESET=\033[0m

bash: ## Enter container as root
	$(DOCKER_ROOT_I) bash

composer-install: ## Run composer install
	$(DOCKER_ROOT) composer install

check-code: phpstan php-cs-fixer ## Fixes code style issues and analyze PHP code for errors

create-network: ## Create network
	-docker network create app-network

deploy: ## Deploy the branch on remote server
	@printf "$(BLUE)Branch name to deploy [main]: $(RESET)"
	@read branch_name; \
	if [ -z "$$branch_name" ]; then \
		branch_name="main"; \
	fi; \
	printf "\n"; \
	printf "$(RESET)"; \
	printf "$(BLUE)Deploying branch: $$branch_name$(RESET)\n"; \
	git fetch -a && git checkout "$$branch_name" && git reset --hard && git pull --rebase; \
	composer install --no-dev --optimize-autoloader; \
	npm install && npx @tailwindcss/cli -i ./assets/styles/app.css -o ./public/assets/tailwind.css; \
	bin/console importmap:install; \
	bin/console asset-map:compile; \
	APP_ENV=prod APP_DEBUG=0 php bin/console cache:clear; \
	printf "$(GREEN)Branch '$$branch_name' deployed successfully.$(RESET)\n";

install: create-network start composer-install ## Install dependencies

php-cs-fixer: composer-install ## Apply coding standards with php-cs-fixer
	$(DOCKER_ROOT) vendor/bin/php-cs-fixer fix

phpstan: composer-install ## Launch static code analysis
	$(DOCKER_ROOT) vendor/bin/phpstan

start: ## Start the project
	COMPOSE_PROJECT_NAME="street-guard" docker compose -f docker-compose.yml up -d --build

stop: ## Stop the project
	COMPOSE_PROJECT_NAME="street-guard" docker compose -f docker-compose.yml down

restart: stop start ## Restart the project

help:
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
