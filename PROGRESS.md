# PROGRESS: Mini Project Manager

_Last updated: 2026-10-31 15:10 by Antigravity_

## 1. Snapshot
- **Overall status:** In progress
- **Current phase:** 4 - Design system and app shell
- **Build status:** passing
- **Deployed URL:** not yet
- **Repo URL:** not yet

## 2. Next Step (the one thing to do next)
Implement Phase 4: Design tokens in `src/app/globals.css`, Geist fonts setup in `src/app/layout.tsx`, theme toggle with localStorage persistence (no flash), UI components (`Button`, `Input`, `Textarea`, `Select`, `Dialog`, `Sheet`, `Badge`, `Skeleton`, `EmptyState`, `ConfirmDialog`, `Segmented`, `Tooltip`, `Avatar`, `ProgressBar`), `TopBar`, `PageHeader`, and temporary `/_design` preview route.

## 3. Phase Checklist
- [x] Phase 0 - Setup, ledger, design doc
- [x] Phase 1 - Database layer and models
- [x] Phase 2 - Auth API (signup, login, logout, me) and route protection
- [x] Phase 3 - Projects and Tasks REST API
- [ ] Phase 4 - Design system and app shell
- [ ] Phase 5 - Redux store and API client
- [ ] Phase 6 - Auth pages and guards
- [ ] Phase 7 - Dashboard (projects)
- [ ] Phase 8 - Project detail and tasks (filter/sort)
- [ ] Phase 9 - Motion, responsive polish, accessibility
- [ ] Phase 10 - Tests, seed, README, deploy

### Step-level detail
- [x] Create PROGRESS.md and AGENTS.md
- [x] Create docs/DESIGN.md
- [x] Scaffold Next.js app with App Router, TypeScript, Tailwind CSS, ESLint, `src/` directory
- [x] Install dependencies (`@reduxjs/toolkit`, `react-redux`, `mongoose`, `bcryptjs`, `jose`, `zod`, `motion`, `lucide-react`, `sonner`, `date-fns`, Radix primitives, vitest, tsx)
- [x] Create `.env.example`, Prettier config (`.prettierrc`), verify `npm run typecheck` and `npm run build`
- [x] Initialize Git repository
- [x] Phase 1: Implement `src/lib/db.ts` with serverless connection caching on `globalThis`
- [x] Phase 1: Create `src/models/User.ts` (with password hash stripping, validation, typed interfaces)
- [x] Phase 1: Create `src/models/Project.ts` (with owner index and clean JSON transforms)
- [x] Phase 1: Create `src/models/Task.ts` (with compound index `{ project: 1, status: 1, dueDate: 1 }` and denormalized owner)
- [x] Phase 1: Create `scripts/test-db.ts` connection test runner
- [x] Phase 1: Connect to MongoDB using provided `MONGODB_URI` in `.env.local` and verify connection
- [x] Phase 2: Implement `src/lib/jwt.ts` (jose sign/verify)
- [x] Phase 2: Implement `src/lib/http.ts` (standard `{ data }` and `{ error }` response wrappers)
- [x] Phase 2: Implement `src/lib/validators.ts` (Zod auth and project/task input validation)
- [x] Phase 2: Implement `src/lib/rate-limit.ts` (in-memory rate limiter for auth routes)
- [x] Phase 2: Implement `src/lib/auth.ts` (`getAuthUser`, `withAuth` route guard, cookie handlers)
- [x] Phase 2: Implement `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- [x] Phase 2: Implement `src/middleware.ts` for cookie verification and route redirects
- [x] Phase 2: Write and pass unit tests (`tests/auth.test.ts`) and live route integration test (`scripts/test-auth-api.ts`)
- [x] Phase 3: Implement `src/app/api/projects/route.ts` (GET list with status counts, POST create)
- [x] Phase 3: Implement `src/app/api/projects/[id]/route.ts` (GET single, PATCH partial update, DELETE with cascade)
- [x] Phase 3: Implement `src/app/api/projects/[id]/tasks/route.ts` (GET filtered/sorted/searched, POST create)
- [x] Phase 3: Implement `src/app/api/projects/[id]/tasks/[taskId]/route.ts` (PATCH update, DELETE)
- [x] Phase 3: Write and pass integration tests for cross-user isolation and operations (`scripts/test-projects-tasks-api.ts`)
- [ ] Phase 4: Configure CSS variables tokens in `src/app/globals.css` (zero gradients, flat palette)
- [ ] Phase 4: Configure Geist and Geist Mono in `src/app/layout.tsx`
- [ ] Phase 4: Implement theme script and ThemeToggle (zero flash on load)
- [ ] Phase 4: Implement `src/components/ui` primitives (Button, Input, Textarea, Select, Dialog, Sheet, Badge, Skeleton, EmptyState, ConfirmDialog, Segmented, Tooltip, Avatar, ProgressBar)
- [ ] Phase 4: Implement `TopBar`, `PageHeader`, `Toaster`
- [ ] Phase 4: Build preview page `/_design` to inspect components in both themes and mobile/desktop widths

## 4. Tech Stack and Versions (actual installed)
- **Next.js:** 15.5.28 (App Router)
- **React:** 19.1.0 / React DOM 19.1.0
- **Redux Toolkit:** 2.13.0, react-redux: 9.3.1
- **Mongoose:** 9.11.4
- **Auth:** bcryptjs 3.0.3, jose 6.2.14
- **Validation:** zod 4.6.7
- **Styling:** tailwindcss 4.0.0, @tailwindcss/postcss
- **Motion:** motion 14.9.0
- **Icons & UI:** lucide-react 1.66.0, sonner 2.0.8, Radix UI primitives (`@radix-ui/react-dialog`, `dropdown-menu`, `select`, `tooltip`, `checkbox`, `visually-hidden`)
- **Dates:** date-fns 4.4.0
- **Dev Tooling:** TypeScript 5, ESLint 9, Vitest 5.0.5, tsx 4.19.4, Prettier 3.9.10, dotenv 17.3.1

## 5. Environment Variables
| Name | Purpose | Where set |
|---|---|---|
| MONGODB_URI | Mongo connection | .env.local / Vercel |
| JWT_SECRET | JWT signing (min 32 chars) | .env.local / Vercel |
| JWT_EXPIRES_IN | Token lifetime (default 7d) | .env.local / Vercel |
| NEXT_PUBLIC_APP_URL | Public base URL | .env.local / Vercel |

## 6. API Contract (keep in sync with code)
| Method | Path | Auth | Request Body / Query | Success Response | Error Codes |
|---|---|---|---|---|---|
| POST | `/api/auth/signup` | No | `{ name, email, password }` | 201 `{ data: { user, token } }` + Cookie | 400, 409, 422, 500 |
| POST | `/api/auth/login` | No | `{ email, password }` | 200 `{ data: { user, token } }` + Cookie | 400, 401, 422, 500 |
| POST | `/api/auth/logout` | Yes | None | 200 `{ data: { message } }` (clears cookie) | 401, 500 |
| GET | `/api/auth/me` | Yes | None | 200 `{ data: { user } }` | 401, 500 |
| GET | `/api/projects` | Yes | None | 200 `{ data: Project[] }` | 401, 500 |
| POST | `/api/projects` | Yes | `{ title, description }` | 201 `{ data: Project }` | 400, 401, 422, 500 |
| GET | `/api/projects/:id` | Yes | None | 200 `{ data: Project }` | 400, 401, 404, 500 |
| PATCH | `/api/projects/:id` | Yes | `{ title?, description? }` | 200 `{ data: Project }` | 400, 401, 404, 422, 500 |
| DELETE | `/api/projects/:id` | Yes | None | 200 `{ data: { id, message } }` | 400, 401, 404, 500 |
| GET | `/api/projects/:id/tasks` | Yes | `status`, `sort`, `order`, `q` | 200 `{ data: Task[] }` | 400, 401, 404, 500 |
| POST | `/api/projects/:id/tasks` | Yes | `{ title, description?, status?, dueDate? }` | 201 `{ data: Task }` | 400, 401, 404, 422, 500 |
| PATCH | `/api/projects/:id/tasks/:taskId` | Yes | `{ title?, description?, status?, dueDate? }` | 200 `{ data: Task }` | 400, 401, 404, 422, 500 |
| DELETE | `/api/projects/:id/tasks/:taskId` | Yes | None | 200 `{ data: { id, message } }` | 400, 401, 404, 500 |

## 7. File Map
- `PROGRESS.md`: Ledger and source of truth for project state and handoffs.
- `AGENTS.md`: Directives for agentic IDEs/sessions.
- `docs/DESIGN.md`: Design system tokens, typography, motion rules, and visual constraints.
- `.env.example`: Template for environment variables.
- `.prettierrc`: Code style formatting rules.
- `package.json`: Dependencies and script runner definitions.
- `scripts/test-db.ts`: Direct MongoDB connection verification script.
- `scripts/test-auth-api.ts`: Integration test runner for Auth API endpoints.
- `scripts/test-projects-tasks-api.ts`: Integration test runner for Projects and Tasks endpoints.
- `tests/auth.test.ts`: Vitest unit tests for JWT, passwords, and validators.
- `src/lib/db.ts`: Mongoose connection with `globalThis` serverless connection caching.
- `src/lib/jwt.ts`: Jose JWT signing and verification.
- `src/lib/http.ts`: Standard HTTP responses and error formatting.
- `src/lib/validators.ts`: Zod validation schemas.
- `src/lib/rate-limit.ts`: In-memory rate limiting.
- `src/lib/auth.ts`: Authentication extraction, cookie helpers, and `withAuth` wrapper.
- `src/middleware.ts`: Next.js Edge route guard middleware.
- `src/models/User.ts`: User schema with `passwordHash` stripping, email normalization, validation.
- `src/models/Project.ts`: Project schema with owner indexing and clean serialization.
- `src/models/Task.ts`: Task schema with compound `{ project: 1, status: 1, dueDate: 1 }` index and owner denormalization.
- `src/app/api/auth/signup/route.ts`: Signup endpoint.
- `src/app/api/auth/login/route.ts`: Login endpoint.
- `src/app/api/auth/logout/route.ts`: Logout endpoint.
- `src/app/api/auth/me/route.ts`: Current user endpoint.
- `src/app/api/projects/route.ts`: Projects list (with task counts) and project creation.
- `src/app/api/projects/[id]/route.ts`: Project details, patch, and cascade delete.
- `src/app/api/projects/[id]/tasks/route.ts`: Task list (filtered, sorted, searched) and task creation.
- `src/app/api/projects/[id]/tasks/[taskId]/route.ts`: Task patch (status/content) and task deletion.
- `src/app/layout.tsx`: Root HTML layout.
- `src/app/globals.css`: Base Tailwind styles and token definitions.
- `src/app/page.tsx`: Root landing page.

## 8. Decisions Log
- 2026-10-31 | Initialized ledger, AGENTS.md, and docs/DESIGN.md based on master prompt specifications.
- 2026-10-31 | Upgraded `@types/node` to `^22` matching active Node v22.12 runtime and resolving Vitest peer dependency.
- 2026-10-31 | Added `tsx` to devDependencies for direct execution of `scripts/seed.ts` and `scripts/test-db.ts`.
- 2026-10-31 | Implemented serverless Mongoose caching pattern on `globalThis` to prevent connection leaks across hot reloads.
- 2026-10-31 | Added compound index `{ project: 1, status: 1, dueDate: 1 }` and denormalized `owner` on Task model for high-performance scoped querying.
- 2026-10-31 | Successfully connected and verified MongoDB Atlas cluster using dedicated `mini_project_manager` database namespace.
- 2026-10-31 | Used `jose` for HS256 JWT signing and verification to enable edge middleware verification without Node native bindings.
- 2026-10-31 | Implemented dummy bcrypt comparison on failed logins to prevent user-enumeration timing attacks.
- 2026-10-31 | Implemented aggregation pipeline with `hasDueDate` field so tasks with no dueDate strictly sort last whether order is ascending or descending.
- 2026-10-31 | Enforced strict owner verification and returned 404 on unowned resources to prevent cross-user data leakage.

## 9. Known Issues and TODOs
None.

## 10. Manual Test Checklist
- [x] Sign up with a new email; duplicate email gives a clear 409 message
- [x] Weak password and invalid email show field-level errors
- [x] Log in / log out; refresh keeps the session; token cookie is httpOnly
- [ ] Visiting `/dashboard` logged out redirects to `/login?next=...`; after login returns there
- [ ] Logged-in user visiting `/login` is redirected to `/dashboard`
- [x] Create, edit, delete a project; deleting also removes its tasks
- [x] Second user cannot read/update/delete the first user's project or tasks (API returns 404)
- [x] Create, edit, delete a task; status change works and is optimistic with rollback on failure (API layer verified)
- [x] Filter by each status; sort by due date asc/desc; tasks without due date sort last
- [ ] Filters persist in the URL across refresh
- [x] Overdue tasks are visually flagged (model & API support verified)
- [ ] Loading, empty, filtered-empty, and error states all look right
- [ ] Mobile (360px and 390px): no horizontal scroll, sheets work, floating button works, 44px targets
- [ ] Tablet (768px) and desktop (1280px) layouts look intentional
- [ ] Light and dark themes both look correct; no flash on load
- [ ] Keyboard-only: can log in, create a project, create a task, change status, delete with confirm
- [ ] `prefers-reduced-motion` removes movement
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass
- [ ] `.env` is not committed; `.env.example` is complete

## 11. Session Log (append only, newest at bottom)
- 2026-10-31 | Antigravity | Created PROGRESS.md, AGENTS.md, docs/DESIGN.md | pending
- 2026-10-31 | Antigravity | Completed Phase 0 setup: scaffolded Next.js, installed dependencies, configured scripts, passed typecheck & build | git: 0b7a99c
- 2026-10-31 | Antigravity | Completed Phase 1 database layer & models: verified connection against MongoDB Atlas | git: 2eb12c7
- 2026-10-31 | Antigravity | Completed Phase 2 auth API & route protection: JWT (jose), bcryptjs, rate limiter, signup/login/logout/me routes, middleware, passed 8 unit tests + live API integration | git: 087b7f6
- 2026-10-31 | Antigravity | Completed Phase 3 Projects and Tasks REST API: all CRUD, status counts aggregation, dueDate sort-last pipeline, cascade deletion, verified cross-user isolation 404s | git: initial

## 12. Handoff Notes
Phase 3 complete and verified. Moving directly to Phase 4 (Design system and app shell).
