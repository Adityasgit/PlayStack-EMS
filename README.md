# PlayStack EMS — Employee Management System

A modern, full-stack Employee Management System built as a **monorepo** with Next.js 14 (frontend) and Express.js (backend), featuring secure JWT authentication, role-based access control, interactive org chart with drag-and-drop, and a beautiful dark-mode UI.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Express.js, Node.js, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookies) + bcryptjs |
| UI Components | shadcn/ui primitives |
| State Management | TanStack Query v5 (server), Zustand (client) |
| Charts | Recharts |
| Org Chart | React Flow + dagre |
| Drag & Drop | dnd-kit (Kanban, table column reorder) |
| Animations | Framer Motion |
| Forms | react-hook-form + Zod |
| Command Palette | cmdk |

## 📋 Features

### Core
- ✅ **JWT Authentication** — httpOnly cookies, auto-redirect on 401
- ✅ **RBAC** — Super Admin, HR Manager, Employee (3-layer enforcement)
- ✅ **Employee CRUD** — Create, Read, Update, Soft Delete
- ✅ **Dashboard** — Animated counters, department pie chart, joining trend bar chart
- ✅ **Org Chart** — Interactive React Flow tree with auto-layout (dagre)
- ✅ **Search, Filter & Sort** — URL-synced, shareable state
- ✅ **Validation** — Zod schemas shared between frontend and backend

### Modern UI
- ✅ **Animated Sidebar** — Framer Motion spring animation, collapse to icons
- ✅ **Command Palette** — Cmd+K global search and navigation
- ✅ **Slide-out Sheet** — Click employee row → edit panel slides in
- ✅ **Multi-step Form Stepper** — 4 steps with animated transitions
- ✅ **Drag & Drop Kanban** — Drag employee cards between Active/Inactive columns
- ✅ **Drag-to-Reorder Columns** — TanStack Table + dnd-kit
- ✅ **Drag-onto-Avatar Upload** — react-dropzone profile image upload
- ✅ **Dark Mode** — next-themes, persisted preference
- ✅ **Toast Notifications** — Sonner with actionable undo toasts

### Bonus
- ✅ **CSV Import** — PapaParse, bulk employee creation
- ✅ **Soft Delete** — Automatic pre-find filter
- ✅ **Dashboard Charts** — Recharts pie + bar charts
- ✅ **Docker** — docker-compose with MongoDB + backend + frontend

## 🏗️ Project Structure

```
PlayStack-EMS/
├── apps/
│   ├── backend/           ← Express.js API (port 4000)
│   │   └── src/
│   │       ├── controllers/   Route handlers
│   │       ├── middleware/     auth + RBAC
│   │       ├── models/        Mongoose schemas
│   │       ├── routes/        Express routes
│   │       ├── services/      Business logic
│   │       ├── lib/           Helpers (jwt, bcrypt, treeBuilder)
│   │       └── validation/    Zod schemas
│   └── frontend/          ← Next.js 16 App Router (port 3000)
│       └── src/
│           ├── app/            Pages (App Router)
│           ├── components/     UI components
│           ├── hooks/          Custom hooks
│           ├── context/        React Context
│           ├── store/          Zustand stores
│           └── lib/            Utilities
├── docker-compose.yml
└── package.json            ← npm workspaces root
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Docker)

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd PlayStack-EMS
npm install

# 2. Start MongoDB (or use Docker)
docker compose up mongo -d

# 3. Start both apps
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000

### Default Login
- **Email:** admin@company.com
- **Password:** Admin@1234

### Environment Variables

**Backend** (`.env`):
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/ems
JWT_SECRET=your_secret_key_min_32_chars
FRONTEND_URL=http://localhost:3000
SEED_ADMIN_EMAIL=admin@company.com
SEED_ADMIN_PASSWORD=Admin@1234
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 🐳 Docker

```bash
# Full stack
docker compose up --build

# Just MongoDB
docker compose up mongo -d
```

## 📡 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | Public | Login, sets httpOnly cookie |
| POST | /api/auth/logout | Any | Clear cookie |
| GET | /api/auth/me | Any | Current user profile |
| GET | /api/employees | SA, HR | List with search/filter/sort/pagination |
| POST | /api/employees | SA, HR | Create employee |
| GET | /api/employees/:id | Any* | Get employee |
| PUT | /api/employees/:id | Any* | Update employee |
| DELETE | /api/employees/:id | SA | Soft delete |
| GET | /api/employees/:id/reportees | Any | Direct reports |
| PATCH | /api/employees/:id/manager | SA | Assign manager |
| POST | /api/employees/import | SA | CSV bulk import |
| GET | /api/organization/tree | Any | Org tree structure |
| GET | /api/dashboard/stats | SA, HR | Dashboard statistics |
| POST | /api/upload | Any | Upload profile image |

## 🛡️ RBAC Enforcement

1. **Route level** — Express middleware: `requireRole('super_admin', 'hr_manager')`
2. **Controller level** — Field-level stripping (e.g., salary hidden from employees)
3. **UI level** — Sidebar nav, buttons, and form fields gated by role

## 📄 License

MIT
