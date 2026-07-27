> [!IMPORTANT]
> **This repository was created for LiKHA-IT's technical test and does not guarantee functionality.**

# Technical Assessment

## Overview

Welcome to the technical assessment phase of our recruitment process. This take-home examination is designed to evaluate your coding standards, problem-solving skills, and ability to navigate an existing codebase.

## 1. Timeline and Communication

- **Duration**: You have 3 calendar days to complete this assessment, starting from the time the invitation email was received.
- **Support**: We do not provide technical support.

## 2. Environment Setup

- **Forking**: Please fork this repository to your personal GitHub account.
- **Visibility**: Ensure your forked repository is set to **Public** so our engineering team can review your code submission.

## 3. Scope of Work

Upon setting up the repository, locate the `TICKETS.md` file in the root directory. This file contains the detailed specifications for the required tasks:

- 1 Feature Implementation
- 1 Bug Fix

## 4. Development Workflow

We expect you to follow best practices regarding version control and documentation:

- **Branching**: Create a dedicated branch for each specific task. Do not commit all changes to the main branch directly. (NOTE: please double check your work and make sure all tests pass)
- **Pull Requests**: Open a separate Pull Request (PR) for each task.
- **Documentation**: We place high value on communication. Ensure your PR descriptions are thorough, explaining your logic, architectural decisions, and how you solved the specific problem.

## 5. Evaluation Criteria

We will review your submission based on the following:

- **Solution Quality**: Functionality and robustness of the code.
- **Code Quality**: Cleanliness, readability, and adherence to standard patterns.
- **Documentation**: The clarity and detail of your Pull Request descriptions.
- **Going Above and Beyond**: You are encouraged to review the entire codebase. If you identify architectural flaws, security risks, or areas for optimization, feel free to open additional PRs or include a critique in your notes. This initiative is highly valued.

## 6. Submission Instructions

Once you have completed the assessment, please reply to the invitation email with the direct links to your Pull Requests using the format below:

Email subject

```
LiKHA-IT TECHNICAL TEST: [Your name]
```

Email contents

```
TASK 1: [Link to Feature PR]
TASK 2: [Link to Bug Fix PR]
BONUS/CRITIQUE: [Link to Optional/Refactoring PR]
** add any other PRs as needed **
```

NOTE: Please don't embed the PR url with the PR title. The following will suffice: `PR Title: https://github.com/{your-github-id}/likhait-technical-test/pull/{pull-request-number}`

Good luck, and we look forward to reviewing your code.

---

# System Description

A full-stack expense tracking application with calendar-based visualization for managing personal finances.

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Running Tests](#running-tests)
- [Database Operations](#database-operations)
- [Resetting a Local Docker Environment](#resetting-a-local-docker-environment)
- [Environment Configuration](#environment-configuration)
- [Contributing](#contributing)
- [Technical Assessment](#technical-assessment)

## Overview

The Expense System is a modern web application designed to help users track and visualize their expenses through an intuitive calendar interface. Built with a React frontend and Rails API backend, it provides a seamless experience for recording daily expenses, categorizing spending, and understanding financial patterns.

## Core Concepts

### Calendar-Based Visualization

Expenses are displayed in a monthly calendar grid, making it easy to see spending patterns across days and weeks.

### Category Organization

All expenses are organized into 10 predefined categories (Food, Transport, Housing, Entertainment, Healthcare, Education, Shopping, Work, Utilities, Other), each with visual emoji indicators.

### Real-Time Updates

The application provides instant feedback when creating, updating, or deleting expenses without page reloads.

### RESTful Architecture

Clean separation between frontend and backend enables scalability and maintainability.

## Technology Stack

### Frontend

- **React 18.2** with **TypeScript 5.3** for type-safe UI development
- **Vite 5.1** as the modern build tool and development server
- Custom **"Vibes"** component library for consistent design

### Backend

- **Ruby 3.3.7** with **Rails 7.2** in API-only mode
- **MySQL 8.0** for relational data storage
- **RSpec** for comprehensive testing

### Infrastructure

- **Docker Compose** for containerized development and deployment
- **Puma** web server for handling concurrent requests
- **CORS** configured for frontend-backend communication

## Quick Start

### Using Docker (Recommended)

```bash
# Clone and navigate to project
cd expense_system_rails

# Start all services (auto-picks a free host port for the DB if 3306 is taken)
./scripts/docker-up.sh

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api
```

**`./scripts/docker-up.sh` vs. plain `docker compose up`**

Both commands build and run the exact same services, from the exact same
`docker-compose.yml` — there is no difference in what ends up running inside
the containers. The only difference is a pre-flight step:

| | `./scripts/docker-up.sh` | `docker compose up` |
|---|---|---|
| Checks if host port `3306` is free before starting | Yes — probes `3306`–`3399` | No |
| Port `3306` is free | Binds `db` to `3306` (identical result) | Binds `db` to `3306` |
| Port `3306` is already in use (e.g. a local MySQL install) | Auto-picks the next free port (e.g. `3307`) and exports it as `DB_PORT` before calling `docker compose up` | Fails to start the `db` service with a "port is already allocated" error |

`DATABASE_HOST`/`DATABASE_PORT` used by the `backend` service always point at
`db:3306` over the internal Docker network, so this host-port choice never
affects backend↔db connectivity — it only matters if *you* need to reach
MySQL directly from the host machine (e.g. a GUI client), in which case check
which port got bound with `docker compose port db 3306`.

### Manual Setup

#### Backend

```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server  # Starts on port 3000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev  # Starts on port 5173
```

## Running Tests

### Backend Tests

```bash
cd backend
bundle exec rspec
bundle exec rubocop
```

## Database Operations

### Using Docker

```bash
docker compose exec backend rails db:migrate
docker compose exec backend rails db:reset
docker compose exec backend rails console
```

### Without Docker

```bash
cd backend
rails db:migrate
rails db:reset
rails console
```

## Resetting a Local Docker Environment

A quick checklist for when the stack is misbehaving and you want to get back
to a known-good state.

### Before starting

- `pgrep -fa "compose up"` — make sure nothing is already attached to this
  project. Running `docker compose up` (or `./scripts/docker-up.sh`) from two
  terminals at once causes the two processes to race each other over the
  same container names, network, and ports — symptoms include ports
  climbing on every run, containers restarting for no obvious reason, and
  `Lost connection to server during query` errors mid-migration.
- `docker compose ps -a` — see what's already there before calling `up`
  again, instead of assuming a clean slate.
- `ss -ltnp | grep <port>` (or `lsof -i :<port>`) — check a port isn't
  already bound by a host service (e.g. a native MySQL install on `3306`)
  before Compose tries to claim it.

### How you start it

- Prefer `docker compose up -d` (detached) for routine dev work over bare
  foreground `up`. Detached mode means the stack's lifecycle isn't tied to
  any one terminal — no risk of "close this terminal, wonder why the
  containers died," and no risk of two foreground instances fighting for
  the same containers. Tail logs separately with `docker compose logs -f
  <service>` from as many terminals as you like without any of them owning
  the process.
- One `up` per project, at a time. Want a second vantage point? Use
  `logs -f`, not a second `up`.

### Tearing down / resetting

- `docker compose down` — stops and removes containers + the network,
  **keeps volumes** (DB data, gem cache, node_modules survive). Default
  "stop for the day" command.
- `docker compose down -v` — same, but also deletes the named volumes. Use
  this specifically when you need a truly fresh DB (e.g. after a schema
  change that needs a full re-migrate) — otherwise stale data outlives the
  fix.
- `docker compose down --remove-orphans` — cleans up containers for
  services that used to exist in the compose file but don't anymore.

### Periodic hygiene (not every run)

- `docker volume ls` / `docker images` — check for orphaned volumes/images
  left behind by renamed or moved project directories.
- `docker compose config --quiet` — validates the compose file
  parses/interpolates correctly before you commit to an `up`.

### Bind-mount gotcha

If the app directory is bind-mounted (`./backend:/rails`), anything the app
writes there — like Rails' `tmp/pids/server.pid` — survives container
restarts even though the *process* it names doesn't. Any "this PID is still
running" check written against a bind-mounted path needs to either not be
trusted across restarts, or get cleared on boot — which is why the
`backend` service's startup command removes it before migrating.

## Environment Configuration

### Backend Environment Variables (Production)

```bash
DATABASE_HOST=your-db-host
DATABASE_USERNAME=your-db-user
DATABASE_PASSWORD=your-password
RAILS_ENV=production
SECRET_KEY_BASE=$(rails secret)
```

## Contributing

1. Follow Rails and React best practices
2. Maintain TypeScript type safety
3. Write tests for new features
4. Run code quality tools:
   - Backend: `bundle exec rubocop`

---

**Built with Ruby on Rails + React + TypeScript**
