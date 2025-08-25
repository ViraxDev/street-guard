# StreetGuard

Real-time pickpocket awareness and prevention. StreetGuard helps residents and travelers stay safe by surfacing high‑risk zones, recent incident reports, and safer routes through an interactive map.

## Overview
StreetGuard is a Symfony-based web application with a modern frontend (Tailwind CSS + Stimulus) that displays:
- A real-time risk map highlighting high/medium/low alert areas.
- A full-screen map view for exploration.
- Modular UI sections (hero, features, partners, stats) on the home page.

This repository includes a Docker-based setup, build tooling, and helper scripts via a Makefile to streamline development, testing, and deployment.

## Features
- Interactive risk map with Mapbox
- Fullscreen map route: `/map`
- Responsive, accessible UI using Tailwind CSS
- Stimulus controllers for map interactivity
- Symfony security setup (extensible for auth)

## Tech Stack
- Backend: PHP, Symfony
- Frontend: Tailwind CSS (via `@tailwindcss/cli`), Stimulus, Twig
- Assets: Importmap, Symfony Asset Mapper
- Map: Mapbox
- Tooling: Docker Compose, Makefile, Composer, PHPStan, PHP CS Fixer, PHPUnit

## Getting Started
### Prerequisites
- Docker and Docker Compose
- Make (optional but recommended)

### Quick Start (Docker)
1. Create network (if not present) and start services:
   - `make install` (runs network creation, starts Docker containers, and installs Composer deps)
   - or run `make start` to just start containers after initial install
2. Install PHP dependencies: `make composer-install` (runs inside the app container)
3. Install Node dependencies and build Tailwind CSS (from host):
   - `npm install`
   - `npx @tailwindcss/cli -i ./assets/styles/app.css -o ./public/assets/tailwind.css`
4. Visit the app:
   - Home: http://localhost:8000/ (or the port exposed by your compose setup)
   - Full map: http://localhost:8000/map

To stop the stack: `make stop`. To restart: `make restart`.

Note: If you change Tailwind sources in `assets/styles/app.css`, re-run the Tailwind build command to regenerate `public/assets/tailwind.css`.

## Useful Makefile Commands
- `make start` — Start project via Docker Compose (detached, build if needed)
- `make stop` — Stop the project
- `make restart` — Restart the project
- `make composer-install` — Run `composer install` inside the container
- `make phpstan` — Static analysis
- `make php-cs-fixer` — Fix coding standards
- `make check-code` — Run both PHPStan and PHP CS Fixer
- `make deploy` — Deploy the selected branch on a remote server (includes asset build and cache clear)

## Development Notes
- Importmap is used to manage JS dependencies in the browser: `{{ importmap('app') }}` is loaded in `base.html.twig`.
- Stimulus controllers power interactive parts like the Mapbox map (e.g., elements with `data-controller="mapbox"`).

## Running Tests and QA
- Unit/functional tests: `vendor/bin/phpunit` (or via your IDE)
- Static analysis: `make phpstan`
- Code style fixes: `make php-cs-fixer`

## Deployment
The Makefile provides a `deploy` target which:
- Pulls the selected branch
- Installs Composer dependencies with `--no-dev` and optimized autoload
- Installs Node deps and builds Tailwind CSS
- Runs `bin/console importmap:install` and `bin/console asset-map:compile`
- Clears cache for prod (`APP_ENV=prod APP_DEBUG=0`)

Use `make deploy` and enter the branch name (defaults to `main`) when prompted. Ensure your server has compatible PHP, Node, and environment configuration.

## Contributing
Issues and contributions are welcome. Please run `make check-code` before opening a pull request.

## License
This project is provided as-is; please check the repository for any license file or add one if missing.
