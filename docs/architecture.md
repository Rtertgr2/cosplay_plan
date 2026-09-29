# Architecture — Cosplay Planner (React + Firebase)

> **สถานะ: ร่าง (T03)** — จะเติมให้ครบใน T52 ตอนโค้ดมีจริงแล้ว
> เอกสารนี้กำหนด "กฎ" ของสถาปัตยกรรม — ใช้ตรวจตอน review ด้วย

---

## 1. Layer Flow

```text
User
  ↓
React (Components)
  ↓
Pages            ← orchestration เท่านั้น
  ↓
Hooks / Context  ← state + side effects
  ↓
Services         ← ข้อมูลล้วน ไม่มี UI
  ↓
Firebase SDK     ← Firestore / Storage / Auth
```

### กฎที่ห้ามละเมิด

| กฎ | ตรวจอย่างไร |
|---|---|
| Component **ห้าม** import service โดยตรง | `grep -r "services/" src/components` |
| Service **ห้าม**มี DOM / toast / redirect / render | `grep -rE "document\.|window\.|alert\(" src/services` |
| Page เป็น **orchestration** — ประสบกันของ hook หลายตัว | อ่าน `pages/*.jsx` ต้องเห็นแค่ composition |
| Hook เรียก service เท่านั้น ไม่เรียก Firebase SDK ตรง | `grep -r "firebase/" src/hooks` |
| **ห้าม** `base64Image` ใน model | `grep -r "base64Image" src/` |
| Utility เป็น **pure function** | `utils/*` ไม่ import service/hook |

---

## 2. Target Folder Structure

```text
src/
├── components/
│   ├── auth/         ProtectedRoute
│   ├── common/       Button, Modal, ConfirmDialog, Loading, EmptyState, ErrorMessage, Toast
│   ├── dashboard/    DashboardHeader, StatsCards, SearchBar, StatusFilter, ProjectGrid, ProjectCard
│   ├── layout/       Layout, Header, Sidebar, MobileNav, ThemeToggle
│   └── project/      ProjectForm, ProjectHero, ProjectInfo, ProjectStatus,
│                     ProjectNote, ProjectItems, ItemForm, ItemList,
│                     ImageUploader, StatusSelect
│
├── pages/            Dashboard, CreateProject, EditProject, ProjectDetail,
│                     Login, Register, NotFound
│
├── services/         firebase, projectService, storageService
│
├── hooks/            useAuth, useProjects, useTheme
│
├── context/          AuthContext
│
├── utils/            constants, validation, projectStats, projectFilters,
│                     image, formatters
│
├── styles/           index, tokens, globals, layout, components
│
├── js/               ⚠️ LEGACY — ลบใน T40
│
├── App.jsx
└── main.jsx
```

> `src/js/` และ `src/style.css` เดิม ยังอยู่จนกว่าจะถึง Phase 9 (T39–T40)
> ห้าม import จาก `src/js/` ในโค้ดใหม่ — ถ้าจำเป็นแปลว่าออกแบบผิด

---

## 3. Data Flow

### Read (Dashboard)

```text
Dashboard.jsx
  ↓ useProjects()
useProjects.js ──useAuth()──→ user.uid
  ↓
projectService.getProjects(uid)
  ↓
Firestore (where ownerId == uid, orderBy updatedAt desc)
  ↓
setState → re-render
```

### Write (Create with image)

```text
ProjectForm (component state)
  ↓ validateProject()
CreateProject.jsx
  ↓
projectService.createProject(uid, data)   → Firestore สร้าง doc → ได้ projectId
  ↓
storageService.uploadProjectImage(file, uid, projectId)   → { url, path }
  ↓
projectService.updateProject(projectId, { imageUrl })
  ↓
navigate('/projects/' + projectId)
```

> หมายเหตุ: สร้าง doc ก่อน upload เสมอ เพราะ Storage path ต้องมี `projectId`

### Delete

```text
Detail → ConfirmDialog
  ↓
projectService.deleteProject(id)          → ลบ Firestore doc
  ↓
storageService.deleteProjectImage(path)   → ลบไฟล์รูป (ถ้ามี)
  ↓
navigate('/')
```

---

## 4. Firestore

```text
projects/{projectId}
  ownerId     string   ← uid เจ้าของ (required — ใช้กับ security rules)
  charName    string
  seriesName  string
  budget      number
  status      string   ← planning|active|waiting|completed|cancelled
  note        string
  imageUrl    string   ← Firebase Storage URL (ไม่ใช่ base64)
  items[]     { name, price, shopLink, category }
  createdAt   Timestamp
  updatedAt   Timestamp
```

### Query ที่ใช้จริง

| Query | ต้องมี index |
|---|---|
| `where("ownerId","==",uid) + orderBy("updatedAt","desc")` | composite (T11) |

### Ownership

```text
ทุก doc ต้องมี ownerId = auth.uid
read/update/delete → เฉพาะ doc ที่ ownerId ตรงกับ auth.uid
```

---

## 5. Storage

```text
users/{userId}/projects/{projectId}/{timestamp}-{filename}
```

Rules: `request.auth.uid == userId` + ชนิดเป็น image + ขนาด ≤ 5MB

---

## 6. Routing

| Path | Page | Auth |
|---|---|---|
| `/login` | Login | ✗ |
| `/register` | Register | ✗ |
| `/` | Dashboard | ✓ |
| `/projects/new` | CreateProject | ✓ |
| `/projects/:id` | ProjectDetail | ✓ |
| `/projects/:id/edit` | EditProject | ✓ |
| `*` | NotFound | — |

> Firebase Hosting ต้องมี rewrite `**` → `/index.html` (T41) ไม่งั้น deep link ไม่ทำงาน

---

## 7. สิ่งที่ยังไม่ตัดสิน (ดูหัวข้อ ?1–?8 ใน `memory.md`)

ยังไม่ finalize ก่อนถึง T09:

```text
- category slug (ไทย vs อังกฤษ)
- emoji ใน status label อยู่ constants หรือ UI layer
- validation บังคับแค่ charName หรือเพิ่ม seriesName
- image limit 5MB (แผน) vs 10MB (ของเดิม)
- แสดง "รวมราคาสินค้า" เพิ่มไหม
- แยก empty state 2 แบบไหม
```

---

*สร้าง: 2026-09-29 (T03) · จะอัปเดตเต็มใน T52*
