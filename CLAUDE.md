# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expense System: a full-stack expense tracker with calendar-based visualization.
- **Backend**: Ruby 3.3.7 / Rails 7.2 (API-only), MySQL 8.0, RSpec + SimpleCov — lives in `backend/`
- **Frontend**: React 18 + TypeScript 5, Vite, Vitest + React Testing Library, Playwright, ESLint — lives in `frontend/`
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

bundle exec rspec                         # full suite; writes coverage/ (SimpleCov) as a side effect
bundle exec rspec spec/models/expense_spec.rb                # one file
bundle exec rspec spec/requests/api/expenses_spec.rb:23      # one example by line
bundle exec rubocop                       # lint (Omakase Rails style)
bundle exec rubocop -A                    # autocorrect
bundle exec brakeman                      # static security scan
```

### Frontend (`cd frontend`)

```bash
npm install
npm run dev             # http://localhost:5173
npm run build            # tsc typecheck + vite build — the type-check gate for TS changes
npm run preview
npm run lint             # ESLint (flat config, eslint.config.js)

npm run test              # vitest run — unit/component tests, single pass
npm run test:watch        # vitest, watch mode
npm run test:coverage     # vitest run --coverage
npx vitest run src/hooks/useCategories.test.ts   # one file
npx vitest run -t "creates a category"           # by test name

npm run e2e               # playwright test — boots backend (rails server -p 3000 -e test)
                           # and frontend (vite dev, port 5173) itself if nothing is
                           # already listening there (see playwright.config.ts)
npx playwright test e2e/category-management.spec.ts   # one e2e file
```

Before considering frontend work done, run `npm run lint`, `npm run build`, and `npm run test` — all three are separate CI gates (see below) and none subsumes another.

### CI

`.github/workflows/ci.yml` at the **repo root** is the workflow GitHub Actions actually runs (on push to `main` and on every PR). It has four jobs: `backend` (rubocop → rspec → uploads `backend/coverage`), `frontend` (eslint → build → vitest coverage → uploads `frontend/coverage`), `e2e` (Playwright against natively-started Rails/Vite servers, `needs: [backend, frontend]`), and `docker-deploy` (builds the real Docker images, boots the real `docker-compose.yml` stack, smoke-tests it, and reruns the Playwright suite against it — the only job that would catch a broken Dockerfile or compose file).

`backend/.github/workflows/ci.yml` also exists but is **dead**: GitHub Actions only reads workflows from `.github/workflows/` at the repository root, so this is leftover from the original `rails new` scaffold before the frontend was added. Don't use it as a reference for how backend CI actually behaves — the root workflow's `backend` job is authoritative.

## Architecture

### Request flow

`frontend/src/services/api.ts` is the **only** place that calls the backend. Components/hooks never call `fetch` directly — they go through `pages/`/`components/`/`hooks/` → `services/api.ts`. Follow this when adding new endpoints: add the fetch wrapper to `api.ts` first, then consume it from a hook or page.

### API contract — read this before touching Expense create/update

The shape of an expense differs between read and write, and this is a real gotcha:
- **Read** (`GET /api/expenses`): `Api::ExpensesController#format_expense` (`backend/app/controllers/api/expenses_controller.rb`) serializes `category` as the **category name string** (`expense.category.name`).
- **Write** (`POST`/`PUT /api/expenses`): the controller's strong params expect **`category_id`** (an integer FK), not a name.
- Because of this mismatch, `createExpense`/`updateExpense` in `frontend/src/services/api.ts` resolve the form's category name back into an id via `fetchCategories()` before submitting. If you change one side of this contract, update the other and this translation step together.
- Both create and update also send a non-persisted **`timezone_offset_minutes`** (from `new Date().getTimezoneOffset()`) alongside the expense payload. `Expense` (`backend/app/models/expense.rb`) exposes this as `attr_accessor :timezone_offset_minutes` (never a DB column) and uses it to compute `max_allowed_date` — the client's local "today" — so the future-date validation compares against the *user's* midnight, not the server's UTC one. If you touch date validation, keep this client-offset plumbing intact rather than validating against `Date.current` directly.

`frontend/src/types.ts` mirrors the Rails JSON shape for API-sourced data (`Expense` keeps `created_at`/`updated_at` snake_case, matching the wire format exactly — don't camelCase these; `Category` is `{ id, name, emoji }`, matching what both `GET /api/categories` and `POST /api/categories` return). Types for data computed entirely on the frontend (`MonthlySummary`, `CategoryBreakdown`, `TopCategory`, `DayExpenses`) use normal camelCase since nothing on the Rails side produces them.

### Categories: index + create only

`backend/config/routes.rb` exposes `resources :categories, only: [:index, :create]`. There is still no update/destroy route or action — if asked to add category editing/deletion, that's new work, not a fix. `Category` (`backend/app/models/category.rb`) validates `name` (presence, case-insensitive uniqueness, ≤100 chars) and `emoji` (presence, ≤10 chars), and defaults `emoji` to `Category::DEFAULT_EMOJI` via a `before_validation` callback when none is given. `Api::CategoriesController#create` also rescues `ActiveRecord::RecordNotUnique` (a concurrent-insert race on the unique index) and turns it into the same 422 shape as a normal validation failure — keep that rescue if you touch this action.

The frontend no longer hardcodes categories: `src/hooks/useCategories.ts` fetches them from the backend and exposes `addCategory`, backing `AddCategoryModal` (`src/components/AddCategoryModal.tsx`). The old static `src/constants/categories.ts` / `categoryEmojis.ts` are gone — the backend is the source of truth for what categories (and their emoji) exist. `src/constants/` today only holds `colors.ts`; don't reintroduce a static category list there.

### Frontend structure — where new code goes

The folder layout is intentional; put new code in the existing folder that matches its role rather than inventing new top-level directories:

- `src/pages/` — top-level, routed views (`App.tsx` switches on a `currentPage` string state, not `react-router` yet, despite the dependency being installed)
- `src/components/` — feature components specific to this app (`Sidebar`, `ExpenseForm`, `CalendarExpenseTable`, `AddCategoryModal`, etc.)
- `src/vibes/` — the internal design-system component library (`Button`, `TextField`, `SelectBox`, `Modal`, `ItemTable`, …), re-exported through `src/vibes/index.ts`. Generic, reusable, unbranded UI primitives belong here, not in `components/`. Form-control primitives here (`TextField`, `SelectBox`) must render a real `<label htmlFor>` wired to the input's `id` — needed for accessibility and for RTL's `getByLabelText` in tests.
- `src/hooks/` — stateful logic extracted from components (`useExpenseForm.ts`, `useCategories.ts`)
- `src/services/` — backend I/O only (`api.ts`)
- `src/utils/` — pure functions, no side effects, no React (`expenseUtils.ts`)
- `src/constants/` — static/shared values that aren't backend data (`colors.ts`)
- `src/types.ts` — single shared types file; add new shared interfaces here rather than scattering per-component type files
- `src/test/setup.ts` — Vitest/RTL global setup (jest-dom matchers etc.), wired via `vite.config.ts`'s `test.setupFiles`; add global test config here, not per-file
- `e2e/` (top-level, alongside `src/`, not inside it) — Playwright specs and shared helpers (`dateHelpers.ts`)

### Backend structure — where new code goes

Standard Rails layout, API-only:

- `app/controllers/api/` — all controllers are namespaced `Api::` (`Api::ExpensesController`, `Api::CategoriesController`), matching the `namespace :api do ... end` block in `routes.rb`. New endpoints go under this namespace.
- `app/models/` — one file per ActiveRecord model. Validations and small callbacks live here (`Category#set_default_emoji`, `Expense#max_allowed_date`) — this is still "thin" by Rails standards, not a place for controller-level concerns like param parsing or HTTP formatting.
- `db/migrate/` + `db/schema.rb` — schema changes go through migrations; `schema.rb` is generated, never hand-edit it
- `spec/` mirrors `app/`: `spec/models/`, `spec/requests/api/`, plus `spec/factories/` (FactoryBot). New model/controller code should get a matching spec in the mirrored path.

## Testing conventions

- **Backend**: RSpec, mirrored 1:1 under `spec/models/` and `spec/requests/api/` (request specs, not controller specs, for the API layer). Specs build data with plain `Model.create!(...)`, not the FactoryBot factories — `spec/factories/expenses.rb` is stale (it still sets a `payer_name` attribute that doesn't exist on the `expenses` table) and isn't referenced by any spec; don't reach for `create(:expense)` without first fixing that factory to match the current schema. SimpleCov starts automatically via `require "simplecov"` at the top of `spec/spec_helper.rb`, so `bundle exec rspec` always regenerates `backend/coverage/` — no separate coverage command.
- **Frontend unit/component tests**: Vitest + React Testing Library, colocated as `*.test.ts`/`*.test.tsx` next to the file under test (`src/services/api.test.ts`, `src/hooks/useCategories.test.ts`, `src/vibes/Modal.test.tsx`, …), not in a separate `__tests__` directory. Follow this colocation for any new test.
- **Frontend e2e**: Playwright specs live under the top-level `e2e/` directory (`category-management.spec.ts`, `expense-ordering.spec.ts`, `future-date-guard.spec.ts`), one file per user-facing flow, not per component. `playwright.config.ts` always sets `reuseExistingServer: true` — it's not conditioned on `!CI`, because the same suite also runs against an already-booted Docker stack in the `docker-deploy` CI job; it still boots fresh servers locally when nothing's listening.
- **Linting**: `eslint.config.js` (flat config) covers `**/*.{ts,tsx}`; test files and `e2e/**` get Node globals in addition to browser globals. There's no Prettier — formatting isn't currently enforced separately from ESLint's rules.

## Conventions

### Naming

- **Ruby/Rails**: `snake_case` for methods, locals, and DB columns (`category_id`, `created_at`, `emoji`); `PascalCase` for classes/modules (`Api::ExpensesController`).
- **TypeScript**: `camelCase` for variables/functions/props, `PascalCase` for components/types/interfaces, `SCREAMING_SNAKE_CASE` for module-level constants (`COLORS`, `DEFAULT_EMOJI`-style constants, `EMOJI_OPTIONS`).
- **Exception at the API boundary**: keep `snake_case` on any TS field that is deserialized directly from a Rails JSON response (`category_id`, `created_at`, `updated_at`) instead of converting it to camelCase — this keeps `types.ts` a truthful mirror of what the backend actually sends. Only camelCase fields that are computed on the frontend.
- React component files are `PascalCase.tsx` matching their default/named export; hooks are `useXxx.ts`; everything else is `camelCase.ts`. Test files append `.test` before the extension (`expenseUtils.test.ts`), matching the source file's name exactly.

### Typing

- **TypeScript**: `strict` mode is on (`tsconfig.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`), plus ESLint's `typescript-eslint` recommended rules. Add new shared shapes as `interface`s in `src/types.ts`; keep function signatures in `services/api.ts` explicitly typed on both params and return (`Promise<Expense>`, etc.) rather than relying on inference across the fetch boundary. Avoid `any`: for components/utilities that need to work over more than one shape, use a constrained generic instead, following `ItemTable<T extends Record<string, unknown>>` (`src/vibes/ItemTable.tsx`) as the reference pattern — this replaced an earlier `any`-typed version.
- **Rails**: no Sorbet/RBS — the schema (`db/schema.rb`) and controller strong params (`expense_params` / `category_params`) are the source of truth for shape instead of a type system. When you change a column or a permitted param, update the controller's serialization method (`format_expense`, or the bare `render json: category` in `Api::CategoriesController`) in the same commit, and update the corresponding TS interface in `types.ts` — this is a manual sync, not enforced by tooling, so it's the most common place for frontend/backend drift.

### Environment variables

Never open, `cat`, or otherwise read `.env`/`.env.*` files or `config/master.key`/`credentials.yml.enc` to inspect secrets — there are currently none checked in, and it should stay that way. Refer to configuration only through the normal code patterns already used in this repo:
- Rails: `ENV.fetch("DATABASE_HOST") { "localhost" }` (see `backend/config/database.yml`, `backend/config/environments/production.rb`) or `Rails.application.credentials`.
- Vite/frontend: `import.meta.env.VITE_*`. Note `docker-compose.yml` already defines `VITE_API_URL` for the `frontend` service, but `src/services/api.ts` does not currently read it — `API_BASE_URL` is hardcoded to `http://localhost:3000/api`. If you need the app to work against a non-default backend host, wire up `import.meta.env.VITE_API_URL` in `api.ts` rather than hardcoding another URL.
- Docker Compose: env vars are declared per-service under `environment:` in `docker-compose.yml`; that file (not a `.env`) is the reference for what's available in each container. CI (`.github/workflows/ci.yml`) sets its own equivalents (`DATABASE_HOST: 127.0.0.1`, etc.) directly in the workflow's `env:` block for the same reason.