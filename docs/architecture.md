# Architecture Notes — Cosplay Planner (React + Firebase)

> Draft — จะอัปเดตให้ตรงกับโค้ดจริงตอนจบโปรเจกต์ (T52)

---

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Pages (Route Level)                    │
│  Dashboard, CreateProject, ProjectDetail, Login, Register   │
└──────────────────────────┬──────────────────────────────────┘
                           │ orchestrate
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Custom Hooks                           │
│  useAuth, useProjects, useTheme, useToast                   │
│  - State management                                         │
│  - Business logic                                           │
│  - Service orchestration                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ call
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Services                               │
│  projectService.js, storageService.js, firebase.js          │
│  - Firebase SDK wrappers                                    │
│  - NO DOM manipulation                                      │
│  - NO UI rendering                                          │
│  - Pure data operations                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ use
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Firebase SDK                           │
│  Firestore, Storage, Auth, Hosting                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Categories

### `src/components/common/`
Shared, reusable UI primitives:
- `Button`, `Modal`, `ConfirmDialog`, `Toast`
- `Loading`, `EmptyState`, `ErrorMessage`
- `Input`, `Select`, `Textarea`, `Label`

### `src/components/layout/`
App shell & navigation:
- `Layout` — root wrapper (header + sidebar + main)
- `Header` — brand, theme toggle, user menu
- `Sidebar` — desktop navigation
- `MobileNav` — bottom nav for mobile
- `ThemeToggle` — light/dark/system switch

### `src/components/dashboard/`
Dashboard-specific:
- `DashboardHeader` — title + create button
- `StatsCards` — 4 stat cards
- `SearchBar` — search input
- `StatusFilter` — status dropdown
- `ProjectGrid` — responsive grid container
- `ProjectCard` — individual project card

### `src/components/project/`
Project form & detail:
- `ProjectForm` — main form orchestration
- `ProjectHero` — detail page hero image
- `ProjectInfo` — charName, series, budget
- `ProjectStatus` — status badge
- `ProjectNote` — note display
- `ProjectItems` — items list
- `ItemForm` — add/edit item
- `ItemList` — list of items in form
- `ImageUploader` — drag-drop, preview, upload progress
- `StatusSelect` — status dropdown with labels

### `src/components/auth/`
- `ProtectedRoute` — wrapper for auth-required routes

---

## Data Flow Rules

1. **Component → Hook → Service → Firebase** (strict)
2. **Component NEVER imports Service directly** (except via hook)
3. **Service NEVER touches DOM** (no `document`, no `window`)
4. **Service NEVER shows toast/alert** (throws/returns errors)
5. **Hook handles**: loading, error, optimistic updates
6. **Page decides**: what to render based on hook state

---

## Firebase Structure

### Firestore
```
projects/{projectId}
  ownerId: string (required, == auth.uid)
  charName: string
  seriesName: string
  budget: number
  status: "planning"|"active"|"waiting"|"completed"|"cancelled"
  note: string
  imageUrl: string (Firebase Storage download URL)
  items: array<{
    name: string
    price: number
    shopLink: string
    category: string
  }>
  createdAt: Timestamp
  updatedAt: Timestamp
```

### Storage
```
users/{userId}/projects/{projectId}/{timestamp}-{filename}
```

### Auth
- Email/Password (initial)
- Google (optional later)

---

## State Management

| State | Location | Persistence |
|-------|----------|-------------|
| User session | `AuthContext` + `onAuthStateChanged` | Firebase Auth (IndexedDB) |
| Projects list | `useProjects` hook | Firestore (source of truth) |
| Form input | Component local state | — |
| Temp image | Component local state (File/Blob) | — |
| Theme preference | `useTheme` hook | localStorage (`cosplay-theme`) |
| Toast queue | `ToastContext` | — |

---

## Routing

```
/                     → Dashboard (protected)
/projects/new         → Create Project (protected)
/projects/:id         → Project Detail (protected)
/projects/:id/edit    → Edit Project (protected)
/login                → Login (public)
/register             → Register (public)
*                     → NotFound
```

---

## Key Conventions

- **File naming**: PascalCase for components (`ProjectCard.jsx`), camelCase for hooks/utils (`useProjects.js`)
- **Imports**: Group by external → internal → relative, alphabetical within group
- **Exports**: Named exports for utilities, default export for components
- **Type safety**: JSDoc @typedef for complex shapes (until TypeScript migration)
- **CSS**: CSS variables from `tokens.css`, component-scoped classes in `components.css`

---

## Migration Mapping (Legacy → New)

| Legacy | New |
|--------|-----|
| `index.html` markup | React components |
| `app.js:init()` | `App.jsx` + providers |
| `app.js:loadDashboard()` | `Dashboard.jsx` + `useProjects()` |
| `app.js:getProjects()` | `projectService.getProjects()` |
| `app.js:getLocalStats()` | `projectStats.js` |
| `app.js:handleSearch()` | `projectFilters.js` + React state |
| `app.js:handleFilter()` | `projectFilters.js` + React state |
| `app.js:createNewProject()` | route `/projects/new` |
| `app.js:populateForm()` | `ProjectForm.jsx` |
| `api.js:list()` | `projectService.getProjects()` |
| `api.js:get()` | `projectService.getProject()` |
| `api.js:create()` | `projectService.createProject()` |
| `api.js:update()` | `projectService.updateProject()` |
| `api.js:delete()` | `projectService.deleteProject()` |
| `state.js.projects` | React state from `useProjects()` |
| `state.js.localStorage` | Firestore |
| `state.js.tempBase64Image` | component-local File/Blob state |
| `ui.js:renderProjects()` | `ProjectGrid` + `ProjectCard` |
| `ui.js:renderItems()` | `ProjectItems` |
| `ui.js:showToast()` | `Toast` |
| `ui.js:showLoading()` | `Loading` |
| `ui.js:switchView()` | React Router |
| `image.js` | `utils/image.js` + `storageService.js` |
| `Code.gs:listProjects()` | `projectService.getProjects()` |
| `Code.gs:getProjectById()` | `projectService.getProject()` |
| `Code.gs:createProject()` | `projectService.createProject()` |
| `Code.gs:updateProject()` | `projectService.updateProject()` |
| `Code.gs:deleteProject()` | `projectService.deleteProject()` |
| `Code.gs:searchProjects()` | client filter first; Firestore query later if needed |

---

## Next Steps (Phases)

1. **M1**: Vite + React bootstrap, env config
2. **M2**: Firebase init, schema, services (CRUD, Storage)
3. **M3**: Auth, Protected Routes, Login/Register
4. **M4**: Hooks, Dashboard, Create/Edit/Detail, Items
5. **M5**: Design System, Layout, UI Redesign (12 tasks)
6. **M6**: Validation, Security Rules, Error Handling
7. **M7**: Legacy Cleanup (remove GAS, vanilla JS, base64)
8. **M8**: Hosting, Testing, Documentation