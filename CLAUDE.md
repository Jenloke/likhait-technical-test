# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expense System: a full-stack expense tracker with calendar-based visualization.
- **Backend**: Ruby 3.3.7 / Rails 7.2 (API-only), MySQL 8.0, RSpec — lives in `backend/`
- **Frontend**: React 18 + TypeScript 5, Vite — lives in `frontend/`
- The two are independent apps that only communicate over HTTP (`frontend/src/services/api.ts` → `backend/app/controllers/api/*`). There is no shared package, generated client, or shared types file between them — keep both sides updated by hand when the API contract changes.

## Commands

### Docker (recommended — runs both stacks)

```bash
./scripts/docker-up.sh          # like `docker compose up`, but auto-picks a free DB host port
docker compose exec backend rails console
docker compose exec backend bundle exec rspec
docker compose exec backend bundle exec rubocop
```

### Backend (`cd backend`)

```bash
bundle install
rails db:create db:migrate db:seed
rails server                              # http://localhost:3000/api

bundle exec rspec                         # full suite
bundle exec rspec spec/models/expense_spec.rb                # one file
bundle exec rspec spec/requests/api/expenses_spec.rb:23      # one example by line
bundle exec rubocop                       # lint (Omakase Rails style)
bundle exec rubocop -A                    # autocorrect
bundle exec brakeman                      # static security scan
```

### Frontend (`cd frontend`)

```bash
npm install
npm run dev        # http://localhost:5173
npm run build       # tsc typecheck + vite build — this IS the type-check step, no separate `tsc --noEmit` script exists
npm run preview
```

There is no test runner or linter configured for the frontend yet (no Jest/Vitest, no ESLint/Prettier config present). Treat `npm run build` as the correctness gate for TS changes.

## Architecture

### Request flow

`frontend/src/services/api.ts` is the **only** place that calls the backend. Components/hooks never call `fetch` directly — they go through `pages/` → `services/api.ts`. Follow this when adding new endpoints: add the fetch wrapper to `api.ts` first, then consume it from a page/hook.

### API contract — read this before touching Expense create/update

The shape of an expense differs between read and write, and this is a real gotcha:
- **Read** (`GET /api/expenses`): `Api::ExpensesController#format_expense` (`backend/app/controllers/api/expenses_controller.rb`) serializes `category` as the **category name string** (`expense.category.name`).
- **Write** (`POST`/`PUT /api/expenses`): the controller's strong params expect **`category_id`** (an integer FK), not a name.
- Because of this mismatch, `createExpense`/`updateExpense` in `frontend/src/services/api.ts` first call `fetchCategories()` to resolve the form's category name back into an id before submitting. If you change one side of this contract, update the other and this translation step together.

`frontend/src/types.ts` mirrors the Rails JSON shape for API-sourced data (`Expense` keeps `created_at`/`updated_at` snake_case, matching the wire format exactly — don't camelCase these). Types for data computed entirely on the frontend (`MonthlySummary`, `CategoryBreakdown`, `TopCategory`, `DayExpenses`) use normal camelCase since nothing on the Rails side produces them.

### Categories are currently read-only via the API

`backend/config/routes.rb` only exposes `resources :categories, only: [:index]`. There's no create/update/destroy route or controller action yet — if you're asked to add category management, you're adding new routes/actions, not fixing existing ones.

### Frontend structure — where new code goes

The folder layout is intentional; put new code in the existing folder that matches its role rather than inventing new top-level directories:

- `src/pages/` — top-level, routed views (`App.tsx` switches on a `currentPage` string state, not `react-router` yet, despite the dependency being installed)
- `src/components/` — feature components specific to this app (`Sidebar`, `ExpenseForm`, `CalendarExpenseTable`, etc.)
- `src/vibes/` — the internal design-system component library (`Button`, `TextField`, `SelectBox`, `Modal`, `ItemTable`, …), re-exported through `src/vibes/index.ts`. Generic, reusable, unbranded UI primitives belong here, not in `components/`.
- `src/hooks/` — stateful logic extracted from components (`useExpenseForm.ts`)
- `src/services/` — backend I/O only (`api.ts`)
- `src/utils/` — pure functions, no side effects, no React (`expenseUtils.ts`)
- `src/constants/` — static/shared values (`categories.ts`, `categoryEmojis.ts`, `colors.ts`)
- `src/types.ts` — single shared types file; add new shared interfaces here rather than scattering per-component type files

### Backend structure — where new code goes

Standard Rails layout, API-only:

- `app/controllers/api/` — all controllers are namespaced `Api::` (`Api::ExpensesController`, `Api::CategoriesController`), matching the `namespace :api do ... end` block in `routes.rb`. New endpoints go under this namespace.
- `app/models/` — one file per ActiveRecord model, associations only (no fat model logic yet — `Expense belongs_to :category`, `Category has_many :expenses, dependent: :destroy`)
- `db/migrate/` + `db/schema.rb` — schema changes go through migrations; `schema.rb` is generated, never hand-edit it
- `spec/` mirrors `app/`: `spec/models/`, `spec/requests/api/`, plus `spec/factories/` (FactoryBot). New model/controller code should get a matching spec in the mirrored path.

## Conventions

### Naming

- **Ruby/Rails**: `snake_case` for methods, locals, and DB columns (`category_id`, `created_at`); `PascalCase` for classes/modules (`Api::ExpensesController`).
- **TypeScript**: `camelCase` for variables/functions/props, `PascalCase` for components/types/interfaces, `SCREAMING_SNAKE_CASE` for module-level constants (`EXPENSE_CATEGORIES`, `CATEGORY_EMOJIS`, `COLORS`).
- **Exception at the API boundary**: keep `snake_case` on any TS field that is deserialized directly from a Rails JSON response (`category_id`, `created_at`, `updated_at`) instead of converting it to camelCase — this keeps `types.ts` a truthful mirror of what the backend actually sends. Only camelCase fields that are computed on the frontend.
- React component files are `PascalCase.tsx` matching their default export; hooks are `useXxx.ts`; everything else is `camelCase.ts`.

### Typing

- **TypeScript**: `strict` mode is on (`tsconfig.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`). Add new shared shapes as `interface`s in `src/types.ts`; keep function signatures in `services/api.ts` explicitly typed on both params and return (`Promise<Expense>`, etc.) rather than relying on inference across the fetch boundary.
- **Rails**: no Sorbet/RBS — the schema (`db/schema.rb`) and controller strong params (`expense_params` in `expenses_controller.rb`) are the source of truth for shape instead of a type system. When you change a column or a permitted param, update `format_expense` (or the equivalent serializer method) in the same commit, and update the corresponding TS interface in `types.ts` — this is a manual sync, not enforced by tooling, so it's the most common place for frontend/backend drift.

### Environment variables

Never open, `cat`, or otherwise read `.env`/`.env.*` files or `config/master.key`/`credentials.yml.enc` to inspect secrets — there are currently none checked in, and it should stay that way. Refer to configuration only through the normal code patterns already used in this repo:
- Rails: `ENV.fetch("DATABASE_HOST") { "localhost" }` (see `backend/config/database.yml`, `backend/config/environments/production.rb`) or `Rails.application.credentials`.
- Vite/frontend: `import.meta.env.VITE_*`. Note `docker-compose.yml` already defines `VITE_API_URL` for the `frontend` service, but `src/services/api.ts` does not currently read it — `API_BASE_URL` is hardcoded to `http://localhost:3000/api`. If you need the app to work against a non-default backend host, wire up `import.meta.env.VITE_API_URL` in `api.ts` rather than hardcoding another URL.
- Docker Compose: env vars are declared per-service under `environment:` in `docker-compose.yml`; that file (not a `.env`) is the reference for what's available in each container.