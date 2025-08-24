.PHONY: bash composer-install create-network help install new-project php-cs-fixer phpstan restart start stop
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

new-project:
	@echo "$(BLUE)"
	@read -p "New project name: " project_name; \
	read -p "Database name: " db_name; \
	read -p "Git repository URL (leave blank to skip): " git_url; \
	echo "Creating a new project..."; \
	cp -r . "../$$project_name"; \
	cd "../$$project_name"; \
	rm README.md && echo "# crm" >> README.md && rm .env.local; \
	rm -rf .git; \
	git init; \
	git config --unset-all remote.upstream.url; \
	git config --unset-all remote.upstream.fetch; \
	git config --unset-all branch.initial_commit.remote; \
	sed -i.bak 's/APP_NAME=.*/APP_NAME='"$$project_name"'/' .env && rm .env.bak; \
	sed -i.bak 's/DATABASE_NAME=.*/DATABASE_NAME='"$$db_name"'/' .env && rm .env.bak; \
	sed -i.bak 's/street-guard_app/'"$$project_name"'_app/g' docker-compose.yml && rm docker-compose.yml.bak; \
	sed -i.bak 's/app-network/'"$$project_name"'_network/g' docker-compose.yml && rm docker-compose.yml.bak; \
	sed -i.bak 's/street-guard/'"$$project_name"'/g' Makefile && rm Makefile.bak; \
	sed -i.bak 's/street-guard_app/'"$$project_name"'_app/g' Makefile && rm Makefile.bak; \
	sed -i.bak 's/street-guard_app/'"$$project_name"'_app/g' infrastructure/nginx/conf.d/default.conf && rm infrastructure/nginx/conf.d/default.conf.bak; \
	if [ -n "$$git_url" ]; then \
		git remote add origin $$git_url; \
		echo "Git repository initialized and remote origin set to $$git_url"; \
	fi; \
	read -p "Enter your Git user.name: " git_user_name; \
	read -p "Enter your Git user.email: " git_user_email; \
	git config user.name "$$git_user_name"; \
	git config user.email "$$git_user_email"; \
	git add .; \
	git commit -m "Initial commit"; \
	echo "$(GREEN)New project '$$project_name' successfully created and Git initialized."; \
	echo "$(YELLOW)Don't forget to check and adjust other parameters in the .env file if necessary."; \
	echo "$(YELLOW)You may want to push your initial commit to the remote repository."

create-network: ## Create network
	-docker network create app-network

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
