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
Firebase SDK     ← Firestore / Auth     (+ ImgBB API สำหรับรูปภาพ)
```

### กฎที่ห้ามละเมิด

| กฎ | ตรวจอย่างไร |
|---|---|
| Component **ห้าม** import service โดยตรง | `grep -r "services/" src/components` |
| Service **ห้าม**มี DOM / toast / redirect / render | `grep -rE "document\.|window\.|alert\(" src/services` |
| Page เป็น **orchestration** — ประสบกันของ hook หลายตัว | อ่าน `pages/*.jsx` ต้องเห็นแค่ composition |
| Hook เรียก service เท่านั้น — ห้ามเรียก Firebase API ตรง (import ได้เฉพาะชนิดค่าอย่าง `Timestamp`) | `grep -r "firebase/" src/hooks` → เจอแค่ `Timestamp` |
| **ห้าม** `base64Image` ใน model | `grep -r "base64Image" src/` |
| Utility เป็น **pure function** | `utils/*` ไม่ import service/hook |

---

## 2. Target Folder Structure

```text
src/
├── components/
│   ├── auth/         ProtectedRoute
│   ├── common/       Modal, ConfirmDialog, Loading, ErrorMessage, Toast
│   ├── dashboard/    DashboardHeader, StatsCards, SearchBar, StatusFilter, ProjectGrid, ProjectCard
│   ├── layout/       Layout, Header, Sidebar, MobileNav, ThemeToggle
│   └── project/      ProjectForm, ProjectHero, ProjectStatus,
│                     ProjectNote, ProjectItems, ItemForm, ItemList,
│                     ImageUploader, StatusSelect
│
├── pages/            Dashboard, CreateProject, EditProject, ProjectDetail,
│                     Login, Register, NotFound
│
├── services/         firebase, projectService, storageService (ImgBB)
│
├── hooks/            useAuth, useToast, useProjects, useProject, useTheme, useImageUpload
│
├── context/          AuthContext, ToastContext
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
storageService.uploadProjectImage(file, projectId)          → ImgBB direct URL (string)
  ↓
projectService.updateProject(projectId, { imageUrl })
  ↓
navigate('/projects/' + projectId)
```

> หมายเหตุ: สร้าง doc ก่อน upload เสมอ เพื่อผูก `imageUrl` กับ `projectId` ที่มีจริง

### Delete

```text
Detail → ConfirmDialog
  ↓
projectService.deleteProject(id)          → ลบ Firestore doc (รูปบน ImgBB ค้าง — ไม่มี API ลบ, ดู §5)
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
  imageUrl    string   ← ImgBB direct URL (ไม่ใช่ base64)
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

## 5. รูปภาพ (ImgBB)

```text
upload:  ImageUploader → processImage (≤5MB, image/*, ห้าม svg, ย่อ ≤1200px)
         → useImageUpload → storageService.uploadProjectImage(file, projectId)
         → POST multipart → api.imgbb.com/1/upload?key=VITE_IMGBB_API_KEY
         → ได้ direct URL (https://i.ibb.co/…) → เก็บใน Firestore imageUrl
```

- **ไม่ใช้ Firebase Storage แล้ว** (บังคับ Blaze/บัตร ตั้งแต่ ก.พ. 2026) — ดู `docs/security-test.md §5`
- `VITE_IMGBB_API_KEY` อยู่ใน client bundle (ยอมรับ — ไม่มี backend) · รูปสาธารณะถ้ามี URL
- รูปค้างเมื่อ replace/remove (ไม่มี API ลบจาก client) — known limitation

---

## 6. Routing

| Path | Page | Layout | Auth |
|---|---|---|---|
| `/` | Landing | `PublicLayout` | ✗ |
| `/login` | Login | `AuthLayout` | ✗ |
| `/register` | Register | `AuthLayout` | ✗ |
| `/dashboard` | Dashboard | `AppLayout` | ✓ |
| `/projects` | Projects | `AppLayout` | ✓ |
| `/projects/new` | CreateProject | `AppLayout` | ✓ |
| `/projects/:id` | ProjectDetail | `AppLayout` | ✓ |
| `/projects/:id/edit` | EditProject | `AppLayout` | ✓ |
| `/settings` | Settings | `AppLayout` | ✓ |
| `*` | NotFound | `AppLayout` | — |

> 3 layout: `PublicLayout` (หน้าสาธารณะ) · `AuthLayout` (แถบบาง ตอนยังไม่ login) · `AppLayout` (แอปเต็มรูปแบบ)
> หน้าที่โหลดแบบ lazy (`React.lazy`) ถูกห่อด้วย `Suspense` + `PageSkeleton` → entry bundle เล็กลงมาก (232 KB จาก 1.6 MB)

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

---

## 8. State Migration Mapping (T19)

| Legacy (`src/js/state.js`) | ใหม่ (React) | หมายเหตุ |
|---|---|---|
| `projects` | `useProjects()` hook | fetch จาก Firestore |
| `currentEditId` | React Router `useParams()` | ไม่ต้องมี state แยก |
| `currentDetailId` | React Router `useParams()` | ไม่ต้องมี state แยก |
| `tempBase64Image` | component-local `useState<File>` | ใช้ในฟอร์มเท่านั้น |
| `tempImageInfo` | component-local state | ใช้ในฟอร์มเท่านั้น |
| `tempItems` | component-local state | ใช้ในฟอร์มเท่านั้น |
| theme | `useTheme()` (UI-11) | localStorage key `cosplay-theme` |

### หลักการ

```text
React state  = source ของ UI state
Firestore    = source ของ persisted data
localStorage = เฉพาะ theme (ไม่ใช่ project database)
```

### ยืนยัน

- [x] ไม่มี `window.State` ในโค้ด React ใหม่
- [x] project data ไม่พึ่ง `localStorage`
- [x] `src/js/state.js` ยังอยู่ (จะลบใน T40)

---

*สร้าง: 2026-09-29 (T03) · อัปเดต: 2026-09-29 (T19) · จะอัปเดตเต็มใน T52*
