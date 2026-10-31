# Mini Project Manager

A fast, focused, and calm project and task management web application. Built end-to-end with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Redux Toolkit**, **Mongoose / MongoDB**, and **JWT authentication**.

Designed with an editorial, high-contrast aesthetic: **zero gradients**, **zero glassmorphism**, and a single vermilion accent (`#E5502B` light / `#FF6A42` dark).

---

## ⚡ Quick Start for Reviewers

A pre-configured demo user and realistic workspaces can be created in seconds using the automated seed script:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (copy example)
cp .env.example .env.local

# 3. Seed database with demo user, 3 projects, and 15 tasks
npm run seed

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with:

| Field | Value |
|---|---|
| **Email** | `demo@example.com` |
| **Password** | `Password123` |

---

## ✨ Features

### 1. Authentication & Route Protection
- **Email & Password Authentication**: Signup and login with strict validation (minimum 8 characters, at least 1 letter and 1 number).
- **Edge Middleware Session Guard**: Verifies `token` HTTP-only cookie using `jose` at the edge; unauthenticated requests to `/dashboard` or `/projects/*` are seamlessly redirected to `/login?next=...`.
- **Timing Attack Defense**: Dummy bcrypt comparison executed on nonexistent emails to maintain consistent response latency and prevent user enumeration.
- **In-Memory Rate Limiting**: Protects auth endpoints against brute-force attacks (5 attempts / 60 seconds per IP).
- **Session Persistence**: Fast, flicker-free `AuthGate` resolver initializes session on client load.

### 2. Projects Management
- **Dashboard Workspace Grid**: Displays user projects with real-time aggregated metrics (`total`, `to do`, `in progress`, `done`, `overdue`).
- **Interactive Metrics Strip**: Animated count-ups displaying global workspace statistics.
- **CRUD Operations**: Create, edit title/description via responsive modals, and delete with cascade deletion of all child tasks.
- **Cross-User Data Isolation**: Queries strictly enforce `owner: userId` and return clean `404 Not Found` for unauthorized project access.

### 3. Tasks & Workflow Engine
- **Three-State Workflow**: `todo` -> `in-progress` -> `done` with an interactive checkmark toggle featuring animated SVG path drawing and line-through text transitions.
- **Due Date Intelligence**:
  - Relative dates (e.g., *"Due in 2 days"*, *"Due tomorrow"*, *"Due yesterday"*).
  - Overdue highlighting in danger token (`#B42318` light / `#F97066` dark) for open tasks past their due date.
  - Tasks without a due date sort last whether order is ascending or descending.
- **Filtering & Search**:
  - Segmented status tabs (`All`, `To do`, `In progress`, `Done`) with live task count badges.
  - Debounced search across task title and description.
  - Sort by due date (earliest/latest) or creation date (newest/oldest).
  - **Bidirectional URL Query Sync**: Filters (`?status=...&sort=...&order=...&q=...`) persist across page refreshes and browser history.
- **Optimistic State Updates**: Status changes and task deletions update the UI immediately with automatic rollback if the API request fails.
- **Mobile Floating Action Button (FAB)**: Quick task creation with safe-area inset support on mobile viewports.

### 4. Design System & Accessibility
- **Editorial Calm Aesthetic**: Flat surfaces, solid borders, 1px lines, and vermilion accent. No floating blurred blobs or generic indigo.
- **Typography**:
  - **Geist Sans**: Modern, highly legible UI typography.
  - **Geist Mono**: Tabular figures for dates, task counts, and metrics.
  - **Fraunces**: Editorial warm serif headline on the public landing page.
- **Theme Engine**: Dark / Light modes with zero flash on initial page load (blocking inline theme script).
- **Accessibility (a11y)**:
  - Strict `@media (prefers-reduced-motion: reduce)` compliance across all animations.
  - High-contrast 2px focus rings (`focus-visible:outline-[var(--accent)]`).
  - Mobile touch targets meet or exceed 44x44px.
  - Mobile inputs use 16px font sizes to prevent iOS Safari auto-zoom.
  - Hybrid `ResponsiveModal`: renders a centered Radix Dialog on desktop and a swipeable bottom sheet on mobile screens.

---

## 🛠 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 15.5 (App Router) + React 19 | Unified full-stack monolith with React Server Components and fast edge middleware. |
| **Language** | TypeScript 5 (Strict mode) | End-to-end type safety from database schemas to Redux slices. |
| **State Management** | Redux Toolkit 2.13 + React Redux 9 | Predictable client state with memoized selectors and optimistic rollback snapshots. |
| **Database & ODM** | MongoDB Atlas + Mongoose 9 | Document store with compound indexing and serverless connection pooling on `globalThis`. |
| **Styling** | Tailwind CSS 4 | Modern utility-first CSS powered by CSS variables design tokens. |
| **Authentication** | `jose` (HS256) + `bcryptjs` | Edge-compatible JWT signing and verification with cost-12 password hashing. |
| **Validation** | Zod 4 | Strict request payload parsing and sanitization. |
| **Animations** | Motion 14 | Subtle micro-interactions, layoutId tab transitions, and animated checkmarks. |
| **Testing** | Vitest 5 | Fast, ESM-native unit testing suite. |

---

## 📂 Project Structure

```
├── docs/
│   └── DESIGN.md                 # Design system specifications and token rules
├── public/
│   └── icon.svg                  # Monogram brand favicon
├── scripts/
│   ├── seed.ts                   # Database seed runner (demo user, projects, tasks)
│   ├── test-db.ts                # Direct MongoDB Atlas connection verifier
│   ├── test-auth-api.ts          # Auth routes integration test runner
│   └── test-projects-tasks-api.ts # Projects & tasks API test runner
├── src/
│   ├── app/
│   │   ├── (app)/                # Authenticated application shell
│   │   │   ├── dashboard/page.tsx # Projects dashboard
│   │   │   ├── projects/[id]/page.tsx # Project detail & task list
│   │   │   └── layout.tsx
│   │   ├── (auth)/               # Auth routes
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── api/                  # REST API Route Handlers
│   │   │   ├── auth/             # /api/auth/{signup, login, logout, me}
│   │   │   └── projects/         # /api/projects & /api/projects/[id]/tasks
│   │   ├── _design/page.tsx      # Design system token & UI primitive catalog
│   │   ├── globals.css           # CSS variables tokens & reduced-motion rules
│   │   ├── layout.tsx            # Root layout with fonts & theme script
│   │   └── page.tsx              # Minimal confident landing page
│   ├── components/
│   │   ├── layout/               # TopBar, PageHeader, UserMenu, ThemeToggle, AuthGate
│   │   ├── projects/             # ProjectCard, ProjectForm, StatsStrip
│   │   ├── tasks/                # StatusCheckControl, DueDateChip, TaskRow, TaskForm, TaskToolbar
│   │   └── ui/                   # Button, Input, Textarea, Select, Dialog, ResponsiveModal, etc.
│   ├── hooks/                    # useMediaQuery, useDebounce
│   ├── lib/                      # db, jwt, auth, validators, rate-limit, http, api-client, utils
│   ├── middleware.ts             # Edge JWT verification and route guard
│   ├── models/                   # Mongoose schemas: User, Project, Task
│   └── store/                    # Redux Toolkit store and slices (auth, projects, tasks)
├── tests/
│   ├── auth.test.ts              # Vitest tests for JWT, passwords, and Zod schemas
│   └── redux.test.ts             # Vitest tests for Redux reducers and selectors
├── PROGRESS.md                   # Source of truth progress ledger
└── AGENTS.md                     # Agentic IDE instructions
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.18 (tested on Node v22)
- **npm** >= 9
- **MongoDB** connection string (local instance or MongoDB Atlas cluster)

### 1. Installation
```bash
git clone <repo-url>
cd "Web Plant Assignment"
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mini_project_manager?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-key-with-at-least-32-characters-minimum
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Seed Database
Populate demo data:
```bash
npm run seed
```

### 4. Run Locally
Start the Next.js development server:
```bash
npm run dev
```
Visit `http://localhost:3000`.

---

## 🧪 Testing & Verification

Run the full validation suite:

```bash
# Unit tests with Vitest (15 passing tests)
npm test

# TypeScript typechecking (zero errors)
npm run typecheck

# ESLint audit (zero warnings or errors)
npm run lint

# Production bundle build
npm run build
```

### Additional Integration Test Runners
Direct integration scripts testing live MongoDB operations:
```bash
# Verify direct database connection
npx tsx scripts/test-db.ts

# Test auth endpoints (signup, duplicate rejection, login, me, logout)
npx tsx scripts/test-auth-api.ts

# Test projects & tasks CRUD, cascade delete, and cross-user isolation
npx tsx scripts/test-projects-tasks-api.ts
```

---

## 📡 REST API Reference

All protected endpoints expect a valid JWT passed either via the `token` HTTP-only cookie or `Authorization: Bearer <token>` header.

### Authentication Endpoints

#### `POST /api/auth/signup`
Creates a new user and sets the `token` cookie.
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com", "password": "Password123"}'
```

#### `POST /api/auth/login`
Authenticates a user and returns a token cookie.
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@example.com", "password": "Password123"}'
```

#### `POST /api/auth/logout`
Clears the authentication cookie.
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

#### `GET /api/auth/me`
Retrieves current authenticated user details.
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: token=<JWT_TOKEN>"
```

---

### Projects Endpoints

#### `GET /api/projects`
Retrieves all projects owned by the user with aggregated task counts.
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Cookie: token=<JWT_TOKEN>"
```

#### `POST /api/projects`
Creates a new project.
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<JWT_TOKEN>" \
  -d '{"title": "Website Redesign", "description": "Brand new marketing pages"}'
```

#### `GET /api/projects/:id`
Retrieves a single project.
```bash
curl -X GET http://localhost:3000/api/projects/<PROJECT_ID> \
  -H "Cookie: token=<JWT_TOKEN>"
```

#### `PATCH /api/projects/:id`
Updates project title and/or description.
```bash
curl -X PATCH http://localhost:3000/api/projects/<PROJECT_ID> \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<JWT_TOKEN>" \
  -d '{"title": "Updated Website Redesign"}'
```

#### `DELETE /api/projects/:id`
Deletes a project and **cascades deletion** to all associated tasks.
```bash
curl -X DELETE http://localhost:3000/api/projects/<PROJECT_ID> \
  -H "Cookie: token=<JWT_TOKEN>"
```

---

### Tasks Endpoints

#### `GET /api/projects/:id/tasks`
Retrieves filtered and sorted tasks.
- **Query parameters:**
  - `status`: `all` | `todo` | `in-progress` | `done` (default: `all`)
  - `sort`: `dueDate` | `createdAt` (default: `createdAt`)
  - `order`: `asc` | `desc` (default: `desc`)
  - `q`: Search substring across title and description
```bash
curl -X GET "http://localhost:3000/api/projects/<PROJECT_ID>/tasks?status=todo&sort=dueDate&order=asc&q=auth" \
  -H "Cookie: token=<JWT_TOKEN>"
```

#### `POST /api/projects/:id/tasks`
Creates a task inside a project.
```bash
curl -X POST http://localhost:3000/api/projects/<PROJECT_ID>/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<JWT_TOKEN>" \
  -d '{
    "title": "Build navigation bar",
    "description": "Responsive topbar with theme toggle",
    "status": "todo",
    "dueDate": "2026-11-15T12:00:00.000Z"
  }'
```

#### `PATCH /api/projects/:id/tasks/:taskId`
Updates a task's title, description, status, or due date.
```bash
curl -X PATCH http://localhost:3000/api/projects/<PROJECT_ID>/tasks/<TASK_ID> \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<JWT_TOKEN>" \
  -d '{"status": "done"}'
```

#### `DELETE /api/projects/:id/tasks/:taskId`
Deletes a task.
```bash
curl -X DELETE http://localhost:3000/api/projects/<PROJECT_ID>/tasks/<TASK_ID> \
  -H "Cookie: token=<JWT_TOKEN>"
```

---

## 🎨 Design System Summary

This application strictly adheres to the visual constraints detailed in [`docs/DESIGN.md`](./docs/DESIGN.md):

- **Palette**: Calm off-white (`#F7F6F2`) in light mode, deep graphite (`#0F0F0E`) in dark mode. Surface elevation achieved through 1px border contrast (`#E4E1D9` / `#2C2B28`).
- **Accent**: Pure Vermilion (`#E5502B` light / `#FF6A42` dark) reserved strictly for primary actions, checkmark completions, and active indicator marks.
- **Status Colors**:
  - `To do`: Muted stone (`#5F5D57` on `#EFEDE6` / `#B5B2A9` on `#262522`)
  - `In progress`: Warm amber (`#9A5A00` on `#FFF1D6` / `#F5B14C` on `#33270F`)
  - `Done`: Forest emerald (`#1B6B45` on `#DDF2E6` / `#5FCB92` on `#12301F`)
- **No Gradients, No Glassmorphism**: High-contrast, tactile interfaces designed for professionals.

---

## 🔒 Security Best Practices

1. **Password Hashing**: `bcryptjs` with salt round cost 12.
2. **Timing Safe Responses**: Failed login attempts execute a dummy bcrypt comparison to ensure uniform response timing.
3. **HTTP-Only Cookies**: Authentication tokens stored in `httpOnly`, `sameSite: "lax"`, and `secure` cookies to eliminate XSS token theft.
4. **Data Isolation**: All MongoDB queries are scoped to the authenticated `owner` ID; non-existent and unowned resources return identical `404 Not Found` responses to prevent ID harvesting.
5. **Rate Limiting**: Auth routes protected by sliding-window rate limiters.
6. **Input Sanitization**: All inputs validated and trimmed using Zod schemas.

---

## 📄 License
MIT License. Built for the Mini Project Manager engineering evaluation.
