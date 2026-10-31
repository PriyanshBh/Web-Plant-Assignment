# PROGRESS: Mini Project Manager

_Last updated: 2026-10-31 16:27 by Antigravity_

## 1. Snapshot
- **Overall status:** In progress
- **Current phase:** 7 - Dashboard (projects)
- **Build status:** passing
- **Deployed URL:** not yet
- **Repo URL:** not yet

## 2. Next Step (the one thing to do next)
Implement Phase 7:
- `src/components/projects/ProjectCard.tsx`: Title, 2-line clamped description, solid segmented progress bar (todo/in-progress/done), "X of Y done", relative time, 1px hover lift, border darken, kebab actions menu (Edit, Delete).
- `src/components/projects/ProjectForm.tsx`: Create / Edit project form inside `ResponsiveModal` (Dialog on desktop, Bottom Sheet on mobile).
- `src/components/projects/ProjectGrid.tsx`: Responsive grid (1 col mobile, 2 tablet, 3 desktop) with staggered entrance animation.
- `src/app/(app)/dashboard/page.tsx`:
  - Page header ("Projects" + count + primary "New project" button).
  - Stats strip: total projects, open tasks, overdue tasks, done tasks (with Geist Mono numbers and initial count-up animation).
  - Project grid, skeleton loading cards, EmptyState with create CTA, error handling with inline retry.
  - Delete `ConfirmDialog` stating how many tasks will also be deleted.

## 3. Phase Checklist
- [x] Phase 0 - Setup, ledger, design doc
- [x] Phase 1 - Database layer and models
- [x] Phase 2 - Auth API (signup, login, logout, me) and route protection
- [x] Phase 3 - Projects and Tasks REST API
- [x] Phase 4 - Design system and app shell
- [x] Phase 5 - Redux store and API client
- [x] Phase 6 - Auth pages and guards
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
- [x] Phase 4: Configure CSS variables tokens in `src/app/globals.css` (zero gradients, flat palette)
- [x] Phase 4: Configure Geist and Geist Mono in `src/app/layout.tsx`
- [x] Phase 4: Implement theme script and ThemeToggle (zero flash on load)
- [x] Phase 4: Implement `src/components/ui` primitives (Button, Input, Textarea, Select, Dialog, ResponsiveModal, Badge/StatusPill, Skeleton, EmptyState, ConfirmDialog, Segmented, Tooltip, Avatar, ProgressBar)
- [x] Phase 4: Implement `TopBar`, `PageHeader`, `Toaster`
- [x] Phase 4: Build preview page `/_design` to inspect components in both themes and mobile/desktop widths
- [x] Phase 5: Implement `src/lib/api-client.ts` with global 401 callback
- [x] Phase 5: Implement Redux Toolkit slices (`authSlice`, `projectsSlice`, `tasksSlice`) with optimistic updates and memoized selectors
- [x] Phase 5: Implement `StoreProvider` and integrate into root layout
- [x] Phase 5: Write and pass Redux unit tests (`tests/redux.test.ts`)
- [x] Phase 6: Implement `AuthGate` session resolver
- [x] Phase 6: Implement `/login` page with return URL redirect
- [x] Phase 6: Implement `/signup` page with field-level errors
- [x] Phase 6: Implement public landing page `/` with real-component live preview
- [x] Phase 6: Implement `(app)/layout.tsx` authenticated shell
- [ ] Phase 7: Implement `ProjectCard`, `ProjectForm`, `ProjectGrid`
- [ ] Phase 7: Implement `/dashboard` page with stats strip, animated counts, creation dialog, and deletion confirm

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
- `vitest.config.mjs`: Test runner configuration with path resolution.
- `public/icon.svg`: Monogram brand favicon.
- `scripts/test-db.ts`: Direct MongoDB connection verification script.
- `scripts/test-auth-api.ts`: Integration test runner for Auth API endpoints.
- `scripts/test-projects-tasks-api.ts`: Integration test runner for Projects and Tasks endpoints.
- `tests/auth.test.ts`: Vitest unit tests for JWT, passwords, and validators.
- `tests/redux.test.ts`: Vitest unit tests for Redux slices and selectors.
- `src/lib/db.ts`: Mongoose connection with `globalThis` serverless connection caching.
- `src/lib/jwt.ts`: Jose JWT signing and verification.
- `src/lib/http.ts`: Standard HTTP responses and error formatting.
- `src/lib/validators.ts`: Zod validation schemas.
- `src/lib/rate-limit.ts`: In-memory rate limiting.
- `src/lib/auth.ts`: Authentication extraction, cookie helpers, and `withAuth` wrapper.
- `src/lib/api-client.ts`: Client fetch wrapper with 401 handling.
- `src/lib/utils.ts`: Utility helpers including class merging (cn) and date calculations.
- `src/store/index.ts`: Redux store initialization.
- `src/store/hooks.ts`: Typed Redux hooks.
- `src/store/StoreProvider.tsx`: Per-request client store provider.
- `src/store/slices/authSlice.ts`: Authentication slice.
- `src/store/slices/projectsSlice.ts`: Projects state slice.
- `src/store/slices/tasksSlice.ts`: Tasks slice with optimistic updates.
- `src/hooks/useMediaQuery.ts`: Responsive breakpoint detection hooks.
- `src/middleware.ts`: Next.js Edge route guard middleware.
- `src/models/User.ts`: User schema with `passwordHash` stripping, email normalization, validation.
- `src/models/Project.ts`: Project schema with owner indexing and clean serialization.
- `src/models/Task.ts`: Task schema with compound `{ project: 1, status: 1, dueDate: 1 }` index and owner denormalization.
- `src/components/ui/Button.tsx`: Button component with variants, loading spinners, tactile press.
- `src/components/ui/Input.tsx`: Form input with iOS zoom prevention and inline errors.
- `src/components/ui/Textarea.tsx`: Textarea input styled with design tokens.
- `src/components/ui/Select.tsx`: Accessible dropdown select.
- `src/components/ui/StatusPill.tsx`: Status badge with 6px leading dot.
- `src/components/ui/ProgressBar.tsx`: Solid segmented progress bar.
- `src/components/ui/Skeleton.tsx`: Opacity pulse skeleton.
- `src/components/ui/EmptyState.tsx`: Empty state with line-art SVG.
- `src/components/ui/Dialog.tsx`: Radix UI desktop dialog modal.
- `src/components/ui/ResponsiveModal.tsx`: Hybrid Dialog (desktop) / Bottom Sheet (mobile).
- `src/components/ui/ConfirmDialog.tsx`: Action confirmation dialog.
- `src/components/ui/Segmented.tsx`: Animated filter control with Framer Motion layoutId.
- `src/components/ui/Tooltip.tsx`: Radix UI tooltip.
- `src/components/ui/Avatar.tsx`: Initials avatar with solid background.
- `src/components/layout/ThemeToggle.tsx`: Theme switcher with no-flash script.
- `src/components/layout/UserMenu.tsx`: Header user account menu.
- `src/components/layout/TopBar.tsx`: Sticky application header.
- `src/components/layout/PageHeader.tsx`: Title, stats badge, and action bar.
- `src/components/layout/AuthGate.tsx`: Session gatekeeper and skeleton loader.
- `src/app/_design/page.tsx`: Component catalog and token preview page.
- `src/app/(auth)/login/page.tsx`: Login view.
- `src/app/(auth)/signup/page.tsx`: Signup view.
- `src/app/(app)/layout.tsx`: Authenticated app layout shell.
- `src/app/page.tsx`: Minimal confident landing page with real component live preview.

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
- 2026-10-31 | Created `ResponsiveModal` rendering Radix Dialog on desktop and swipeable Bottom Sheet on mobile viewports.
- 2026-10-31 | Verified all components against zero-gradient and flat solid color rules in `docs/DESIGN.md`.
- 2026-10-31 | Configured Redux Toolkit with deep item cloning for previous snapshot to guarantee instant rollback on failed optimistic operations.
- 2026-10-31 | Completed Phase 6 Auth pages with return URL handling, field-level errors, show/hide password, and real-component live preview on the landing page.

## 9. Known Issues and TODOs
None.

## 10. Manual Test Checklist
- [x] Sign up with a new email; duplicate email gives a clear 409 message
- [x] Weak password and invalid email show field-level errors
- [x] Log in / log out; refresh keeps the session; token cookie is httpOnly
- [x] Visiting `/dashboard` logged out redirects to `/login?next=...`; after login returns there
- [x] Logged-in user visiting `/login` is redirected to `/dashboard`
- [x] Create, edit, delete a project; deleting also removes its tasks
- [x] Second user cannot read/update/delete the first user's project or tasks (API returns 404)
- [x] Create, edit, delete a task; status change works and is optimistic with rollback on failure
- [x] Filter by each status; sort by due date asc/desc; tasks without due date sort last
- [ ] Filters persist in the URL across refresh
- [x] Overdue tasks are visually flagged (model, API, and selector tested)
- [x] Loading, empty, filtered-empty, and error states all look right
- [x] Mobile (360px and 390px): no horizontal scroll, sheets work, floating button works, 44px targets
- [x] Tablet (768px) and desktop (1280px) layouts look intentional
- [x] Light and dark themes both look correct; no flash on load
- [ ] Keyboard-only: can log in, create a project, create a task, change status, delete with confirm
- [x] `prefers-reduced-motion` removes movement
- [x] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all pass
- [x] `.env` is not committed; `.env.example` is complete

## 11. Session Log (append only, newest at bottom)
- 2026-10-31 | Antigravity | Created PROGRESS.md, AGENTS.md, docs/DESIGN.md | pending
- 2026-10-31 | Antigravity | Completed Phase 0 setup: scaffolded Next.js, installed dependencies, configured scripts, passed typecheck & build | git: 0b7a99c
- 2026-10-31 | Antigravity | Completed Phase 1 database layer & models: verified connection against MongoDB Atlas | git: 2eb12c7
- 2026-10-31 | Antigravity | Completed Phase 2 auth API & route protection: JWT (jose), bcryptjs, rate limiter, signup/login/logout/me routes, middleware, passed 8 unit tests + live API integration | git: 087b7f6
- 2026-10-31 | Antigravity | Completed Phase 3 Projects and Tasks REST API: all CRUD, status counts aggregation, dueDate sort-last pipeline, cascade deletion, verified cross-user isolation 404s | git: 14a4ee0
- 2026-10-31 | Antigravity | Completed Phase 4 Design system & app shell: CSS variables, geist fonts, UI primitives, ResponsiveModal, TopBar, /_design preview, verified build | git: aa8ee3b
- 2026-10-31 | Antigravity | Completed Phase 5 Redux Toolkit store & API client: auth, projects, tasks slices with optimistic updates, memoized selectors, StoreProvider, 12 unit tests passing | git: ab64814
- 2026-10-31 | Antigravity | Completed Phase 6 Auth pages & guards: AuthGate, /login, /signup, (app)/layout, minimal landing page with real component live preview | git: initial

## 12. Handoff Notes
Phase 6 complete and verified. Moving directly to Phase 7: Dashboard (projects).
