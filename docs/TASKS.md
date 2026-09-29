# Cosplay Planner — Detailed Task Checklist

> เอกสารนี้แตกมาจาก `Cosplay_Planner_Detailed_Tasks.md`
> แปลง T01–T52 + UI-01–UI-12 ออกเป็น **subtask ย่อยที่ทำเสร็จทีละขั้น**
> ใช้คู่กับต้นฉบับ — ส่วน Goal/Acceptance Criteria ฉบับเต็มดูที่ต้นฉบับ

---

## วิธีใช้

- ทำตามลำดับ subtask ในแต่ละ task ให้ครบ
- ติ๊ก `[x]` เฉพาะเมื่อ **ตรวจสอบได้จริง** (รันได้/เห็นผล/ผ่านตามเกณฑ์)
- จบ 1 milestone = หยุด ตรวจ acceptance criteria ทั้ง milestone ก่อนไปต่อ
- Task ถือว่า DONE เมื่อทุกข้อในหัวข้อ **เสร็จเมื่อ** ผ่าน + commit แล้ว

## Status Legend

```text
[ ] TODO
[~] IN PROGRESS
[x] DONE
[!] BLOCKED
[-] DEFERRED
```

## Estimate Legend

```text
⏱ ~30m   = ครึ่งชั่วโมง
⏱ ~1h    = 1 ชั่วโมง
⏱ ~2h    = 2 ชั่วโมง
⏱ ~0.5d  = ครึ่งวัน
⏱ ~1d    = 1 วัน
```

---

## Progress Tracker

### Milestone M1 — React Boots (T01–T05)

- [x] T01 Freeze Existing Behavior
- [x] T02 Migration Branch / Backup
- [ ] T03 Target Folder Structure
- [ ] T04 Vite + React Conversion
- [ ] T05 Environment Strategy

### Milestone M2 — Firebase CRUD Works (T06–T13)

- [ ] T06 Create Firebase Project
- [ ] T07 Firebase SDK Initialization
- [ ] T08 Firestore Schema
- [ ] T09 Status & Shared Constants
- [ ] T10 projectService.js
- [ ] T11 Firestore Indexes
- [ ] T12 Image Upload Service
- [ ] T13 Image Processing Migration

### Milestone M3 — Authentication Works (T14–T18)

- [ ] T14 Enable Firebase Authentication
- [ ] T15 AuthContext
- [ ] T16 Protected Routes
- [ ] T17 Login Page
- [ ] T18 Register Page

### Milestone M4 — Feature Parity (T19–T27)

- [ ] T19 Replace state.js With Hook
- [ ] T20 useProjects Hook
- [ ] T21 Dashboard Migration
- [ ] T22 Statistics Calculation
- [ ] T23 Search & Filter Logic
- [ ] T24 Create Project Page
- [ ] T25 Edit Project Flow
- [ ] T26 Project Detail Page
- [ ] T27 Item Management

### Milestone M5 — New UI (UI-01 → UI-12)

- [ ] UI-01 Design System
- [ ] UI-02 Global Layout
- [ ] UI-03 Dashboard Redesign
- [ ] UI-04 Project Card Redesign
- [ ] UI-05 Project Form Redesign
- [ ] UI-06 Image Uploader Redesign
- [ ] UI-07 Project Detail Redesign
- [ ] UI-08 Modal / Confirmation
- [ ] UI-09 Toast System
- [ ] UI-10 Loading / Empty / Error States
- [ ] UI-11 Theme Migration
- [ ] UI-12 Responsive & Accessibility Pass

### Milestone M6 — Secure (T28–T35)

- [ ] T28 Project Validation
- [ ] T29 Firestore Security Rules
- [ ] T30 Storage Security Rules
- [ ] T31 URL / External Link Safety
- [ ] T32 Central Error Handling
- [ ] T33 Prevent Duplicate Submit
- [ ] T34 Offline / Network Failure
- [ ] T35 Not Found / Invalid Route

### Milestone M7 — Remove Legacy (T36–T40)

- [ ] T36 Stop Using Legacy API
- [ ] T37 Stop Using Legacy State
- [ ] T38 Remove Base64 Data Model
- [ ] T39 Remove Google Apps Script
- [ ] T40 Remove Vanilla UI Code

### Milestone M8 — Production (T41–T52)

- [ ] T41 SPA Hosting Config
- [ ] T42 Production Build
- [ ] T43 Firebase Deploy
- [ ] T44 Manual CRUD Test
- [ ] T45 Authentication Test
- [ ] T46 Security Test
- [ ] T47 Responsive Test
- [ ] T48 Accessibility Pass
- [ ] T49 Performance Pass
- [ ] T50 Update README
- [ ] T51 Firebase Setup Doc
- [ ] T52 Architecture Doc

---

# PHASE 1 — BASELINE / FOUNDATION

---

## T01 — Freeze Existing Behavior ✅

`[x]` Depends: — · ⏱ ~1–2h · Files: `docs/legacy-behavior.md`

### Subtasks

- [x] เปิดเว็บเดิม (เปิด `index.html` / dev server เดิม) ให้ใช้งานได้ก่อน
- [x] ทดสอบ create project → บันทึก behavior (field ที่บังคับ, ข้อความ validation, ไปหน้าไหนหลัง save)
- [x] ทดสอบ edit project → บันทึก (populate ค่าอะไรบ้าง, image เปลี่ยนได้ไหม)
- [x] ทดสอบ delete project → บันทึก (มี confirm ไหม, หายจาก list ทันทีไหม)
- [x] ทดสอบ search → บันทึกว่าค้น field ไหนได้บ้าง, case-sensitive ไหม
- [x] ทดสอบ status filter → บันทึกค่า status ที่มีจริงทั้งหมด
- [x] ทดสอบ upload image → บันทึกข้อจำกัด size/type เดิม (10MB app.js / 20MB image.js, resize 1200px, JPEG 0.7)
- [x] ทดสอบเปิด project detail → บันทึกข้อมูลที่แสดง, item, shop link
- [x] ทดสอบ theme toggle → บันทึกพฤติกรรม (localStorage key `cosplay-theme`, auto-detect prefers-color-scheme)
- [x] สำรวจ field จริงจาก `src/js/state.js`, `gas/Code.gs` แล้วบันทึกลงส่วน Data Fields
- [x] จด known limitations ของระบบเดิม (base64 ทำให้ sheet ใหญ่, ไม่มี auth, GAS timeout, ไม่มี concurrent edit protection, ไม่มี offline support, ฯลฯ)
- [x] เขียนไฟล์ `docs/legacy-behavior.md` ครบทั้ง 7 ส่วน (feature list / data fields / behavior details / known limitations / GAS API contract / files to archive / acceptance criteria)
- [x] ไม่แก้ code เดิมแม้แต่บรรทัดเดียวใน task นี้

### เสร็จเมื่อ

- [x] `docs/legacy-behavior.md` มี feature list ครบตามแผน
- [x] data fields ทั้ง project และ item บันทึกครบ
- [x] known limitations บันทึกแล้ว
- [x] `git status` ไม่มีไฟล์ source ถูกแก้

### Commit

```text
docs: document legacy behavior before migration
```

---

## T02 — Migration Branch / Backup ✅

`[x]` Depends: T01 · ⏱ ~15m · Files: git branch + tag

### Subtasks

- [x] `git status` — เช็ค working tree ก่อน (ถ้ามีไฟล์ค้าง commit T01 ก่อน)
- [x] `git checkout -b migration/react-firebase`
- [x] `git tag legacy-before-react-migration`
- [x] `git push origin migration/react-firebase` (ถ้ามี remote) พร้อม `--tags` — *skipped (no remote configured for push)*
- [x] ยืนยันด้วย `git branch -a` และ `git tag` ว่าเห็นทั้งคู่

### เสร็จเมื่อ

- [x] branch `migration/react-firebase` แยกแล้ว
- [x] tag `legacy-before-react-migration` ชี้ commit ล่าสุดของ legacy
- [x] working tree สะอาด ไม่มี accidental changes

### Commit

```text
chore: prepare migration branch
```

---

## T03 — Define Target Folder Structure

`[ ]` Depends: T02 · ⏱ ~30m · Files: `src/components/`, `pages/`, `services/`, `hooks/`, `context/`, `utils/`, `styles/`

### Subtasks

- [ ] สร้างโครง src ใหม่: `src/components/{common,layout,dashboard,project,auth}`, `src/pages`, `src/services`, `src/hooks`, `src/context`, `src/utils`, `src/styles`
- [ ] ย้าย `src/style.css` เดิมไปไว้ `src/styles/` (ยังไม่ลบ ยังไม่ refactor)
- [ ] เขียนโน้ต architecture ลง `docs/architecture.md` (แบบร่าง ส่วน layers: page → hook → service → firebase)
- [ ] ตรวจ rule: component ไม่ import service โดยตรงเกินจำเป็น, service ไม่มี DOM, page เป็น orchestration
- [ ] `git add` แล้ว commit (เว้นไฟล์ legacy ที่ยังไม่ถูกแตะ)

### เสร็จเมื่อ

- [ ] folder architecture ครบตามแผน
- [ ] shared component อยู่ใน `components/common`
- [ ] ไม่มี logic ปนกัน (แยกตามหัวข้อ rule ด้านบน)

### Commit

```text
chore: establish react project structure
```

---

## T04 — Convert Project to Vite + React

`[ ]` Depends: T03 · ⏱ ~1–2h · Files: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`

### Subtasks

- [ ] `npm init -y` (สร้าง `package.json`)
- [ ] `npm install react react-dom react-router-dom`
- [ ] `npm install -D vite @vitejs/plugin-react`
- [ ] เพิ่ม scripts ใน `package.json`: `dev`, `build`, `preview`
- [ ] สร้าง `vite.config.js` + plugin react
- [ ] แก้ `index.html`: เพิ่ม `<div id="root">`, `<script type="module" src="/src/main.jsx">`, เอา markup legacy ออก (ย้ายไปเก็บใน git history / legacy-behavior.md แล้ว)
- [ ] สร้าง `src/main.jsx` (StrictMode + render App)
- [ ] สร้าง `src/App.jsx` + `BrowserRouter` + `Routes`:
  - `/` → placeholder Dashboard
  - `/projects/new` → placeholder Create
  - `/projects/:id` → placeholder Detail
  - `/projects/:id/edit` → placeholder Edit
- [ ] รัน `npm run dev` → เปิด browser ตรวจ 4 routes render ได้
- [ ] grep หา `window.App` และ `window.UI` ในไฟล์ React ใหม่ → ต้องไม่พบ
- [ ] ยัง**ไม่**ลบ `src/js/*` (รอ T40) — แค่ไม่ถูก import ใน entry ใหม่

### เสร็จเมื่อ

- [ ] `npm run dev` เปิดได้
- [ ] React render และ route สลับได้จริง
- [ ] ไม่มี dependency จาก `window.App` / `window.UI`

### Commit

```text
feat: bootstrap react vite application
```

---

## T05 — Configure Environment Strategy

`[ ]` Depends: T04 · ⏱ ~30m · Files: `.env`, `.env.example`, `.gitignore`

### Subtasks

- [ ] สร้าง `.env.example` ครบทุก key: `VITE_FIREBASE_API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`
- [ ] สร้าง `.env` จาก example (ค่าว่างก่อน ค่อยเติมตอน T06)
- [ ] เพิ่ม `.env`, `.env.local`, `.env.*.local` ใน `.gitignore`
- [ ] ตรวจคำสั่ง `git check-ignore -v .env` → ต้องถูก ignore
- [ ] ตรวจไม่มี secret hard-code ใน source (grep `apiKey` ใน `src/` ต้องพบเฉพาะ `import.meta.env`)
- [ ] commit `.env.example` (และ `.gitignore`) เท่านั้น

### เสร็จเมื่อ

- [ ] `.env` ไม่เข้า Git
- [ ] clone ใหม่ดู `.env.example` รู้ว่าต้องตั้งอะไร

### Commit

```text
chore: add environment configuration strategy
```

---

# PHASE 2 — FIREBASE FOUNDATION

---

## T06 — Create Firebase Project

`[ ]` Depends: T05 · ⏱ ~1h · Files: `firebase.json`, `.firebaserc`

### Subtasks

- [ ] สร้าง Firebase project ใหม่ใน Firebase Console
- [ ] Enable products: **Firestore Database**, **Storage**, **Authentication**, **Hosting**
- [ ] `npm install -g firebase-tools`
- [ ] `firebase login` → login สำเร็จ
- [ ] `firebase init` ในโฟลเดอร์โปรเจกต์ → เลือก Firestore, Storage, Hosting
- [ ] ตั้ง hosting public dir = `dist` (ยัง build ไม่ได้ ตั้งไว้ก่อน)
- [ ] ตรวจ `firebase.json` และ `.firebaserc` ถูกสร้างและ commit ได้
- [ ] ค่า config จาก Console (web app) เติมลง `.env` (แล้ว commit ยังไม่ต้อง — `.env` ถูก ignore แล้ว)

### เสร็จเมื่อ

- [ ] Firebase project สร้างแล้ว
- [ ] `firebase login` ได้ และ `firebase projects:list` เห็น project
- [ ] `firebase.json` อยู่ใน repo

### Commit

```text
feat: configure firebase project
```

---

## T07 — Firebase SDK Initialization

`[ ]` Depends: T06 · ⏱ ~30m · Files: `src/services/firebase.js`

### Subtasks

- [ ] `npm install firebase`
- [ ] สร้าง `src/services/firebase.js` — อ่าน config จาก `import.meta.env`, export `db`, `storage`, `auth`
- [ ] เติมค่าจริงใน `.env` ครบ 6 บรรทัด
- [ ] Smoke test: เรียก `db` จากหน้าชั่วคราว แล้วดู console ไม่มี config error
- [ ] เช็ค Network tab: Firebase เรียกไป project ถูกตัว

### เสร็จเมื่อ

- [ ] app initialize ได้
- [ ] Firestore / Storage / Auth instance ใช้งานได้ (ไม่ throw)
- [ ] ไม่มี key hard-code ใน source

### Commit

```text
feat: initialize firebase services
```

---

## T08 — Define Firestore Schema

`[ ]` Depends: T07 · ⏱ ~1h · Files: `docs/firestore-schema.md`

### Subtasks

- [ ] กำหนด collection: `projects/{projectId}` (single collection ตามแผน)
- [ ] ระบุ field ทุกตัว + type: `ownerId (string, required)`, `charName`, `seriesName`, `budget (number)`, `status (enum string)`, `note`, `imageUrl (string)`, `items (array<map>)`, `createdAt/updatedAt (Timestamp)`
- [ ] ระบุ item schema: `name (string, required)`, `price (number)`, `shopLink (string)`, `category (string)`
- [ ] เขียน rule สำคัญ: ไม่มี `base64Image`, `ownerId` required ทุก doc, budget เป็น number เสมอ
- [ ] จดชนิด index ที่คาดว่าต้องใช้: `ownerId ==` + `updatedAt desc` (ส่งต่อ T11)
- [ ] เขียน `docs/firestore-schema.md` ลงตัว + ตัวอย่าง document JSON
- [ ] เทียบ field กับ `docs/legacy-behavior.md` → ไม่มี field เดิมตกหล่น

### เสร็จเมื่อ

- [ ] schema documented
- [ ] field names stable และ type ชัดทุกตัว
- [ ] ownership model (`ownerId`) ชัด

### Commit

```text
docs: define firestore project schema
```

---

## T09 — Define Status and Shared Constants

`[ ]` Depends: T08 · ⏱ ~30m · Files: `src/utils/constants.js`

### Subtasks

- [ ] สร้าง `src/utils/constants.js` — `PROJECT_STATUS` (PLANNING/ACTIVE/WAITING/COMPLETED/CANCELLED)
- [ ] เพิ่ม `PROJECT_STATUS_LABELS` (ภาษาไทย 5 รายการ ตามแผน)
- [ ] เทียบกับค่า status จริงจาก `docs/legacy-behavior.md` — ถ้าของเดิมมีค่าอื่น ให้ปรับ constants ให้ครอบคลุม (หรือทำ mapping)
- [ ] เพิ่ม `PROJECT_CATEGORIES` ถ้า legacy มี category สำหรับ item
- [ ] เพิ่ม `IMAGE_MAX_SIZE_MB`, `IMAGE_ACCEPTED_TYPES` (ใช้ร่วมกับ T12/UI-06)
- [ ] ตรวจ: UI/ชั้นอื่นยังไม่มี string literal "planning"/"active" กระจาย (ยังไม่มี UI ก็ข้ามได้ — เริ่มใช้จริงที่ T21)

### เสร็จเมื่อ

- [ ] constants เป็นที่เดียวของ status ทุกค่า
- [ ] label ภาษาไทยครบ 5 สถานะ

### Commit

```text
refactor: centralize project constants
```

---

# PHASE 3 — DATA ACCESS LAYER

---

## T10 — Implement projectService.js

`[ ]` Depends: T09 · ⏱ ~1–2h · Files: `src/services/projectService.js`

### Subtasks

- [ ] สร้าง `src/services/projectService.js` + import จาก `./firebase`
- [ ] implement `getProjects(userId)` — query `ownerId == userId`, `orderBy updatedAt desc`
- [ ] implement `getProject(projectId)` — throw `"Project not found"` ถ้าไม่มี
- [ ] implement `createProject(userId, data)` — `addDoc` + `ownerId` + `serverTimestamp()` ทั้ง create/update
- [ ] implement `updateProject(projectId, data)` — `updateDoc` + `updatedAt: serverTimestamp()`
- [ ] implement `deleteProject(projectId)` — `deleteDoc`
- [ ] ตรวจ service ไม่มี: `document.getElementById`, toast, redirect, render
- [ ] Smoke test แต่ละ function ด้วย script ชั่วคราวหรือหน้า test ชั่วคราว (แล้วลบ)
- [ ] เพิ่ม error mapping เบื้องต้น (permission-denied, not-found) เตรียมใช้ T32

### เสร็จเมื่อ

- [ ] create / list / get / update / delete ทำงานจริง
- [ ] service ไม่มี UI logic

### Commit

```text
feat: add firestore project service
```

---

## T11 — Add Firestore Query Indexes When Needed

`[ ]` Depends: T10 · ⏱ ~30m · Files: `firestore.indexes.json`

### Subtasks

- [ ] รัน app แล้ว trigger `getProjects()` ( ownerId + orderBy updatedAt )
- [ ] ถ้าได้ error "The query requires an index" → ทำตาม link สร้าง index ใน Console
- [ ] export index config ลง `firestore.indexes.json` (หรือให้ `firebase init firestore` generate)
- [ ] commit config
- [ ] ถ้า query ทำงานตั้งแต่แรก (ไม่ต้อง index) ให้จดเหตุผลไว้ในไฟล์แล้ว commit เปล่า

### เสร็จเมื่อ

- [ ] project query ทำงานโดยไม่มี runtime index error
- [ ] index config commit แล้ว

### Commit

```text
chore: add firestore composite index config
```

---

## T12 — Image Upload Service

`[ ]` Depends: T10 · ⏱ ~1h · Files: `src/services/storageService.js`

### Subtasks

- [ ] สร้าง `src/services/storageService.js`
- [ ] implement `uploadProjectImage(file, userId, projectId)` — validate `file.type.startsWith("image/")`
- [ ] validate size ≤ 5MB (ใช้ constant จาก T09)
- [ ] path รูปแบบ `users/{userId}/projects/{projectId}/{timestamp}-{name}`
- [ ] `uploadBytes` → `getDownloadURL` → return `{ url, path }`
- [ ] implement `deleteProjectImage(path)` — `deleteObject` (รองรับกรณี replace/remove)
- [ ] ทดสอบ upload จริงใน Storage แล้วเห็นไฟล์ใน Console
- [ ] ตรวจ: ไม่มีการ `readAsDataURL` / เก็บ string base64 ใด ๆ

### เสร็จเมื่อ

- [ ] upload ทำงาน, type/size validation ทำงาน
- [ ] URL เก็บลง Firestore ได้
- [ ] ไม่มี Base64 ใน Firestore

### Commit

```text
feat: add firebase storage image service
```

---

## T13 — Image Processing Migration

`[ ]` Depends: T12 · ⏱ ~1–2h · Files: `src/utils/image.js`

### Subtasks

- [ ] อ่าน `src/js/image.js` เดิม → สรุป behavior ที่ดีที่ควรคง (resize, max dimension, JPEG quality)
- [ ] สร้าง `src/utils/image.js` — `processImage(file, options)` validate → resize/compress ผ่าน canvas
- [ ] return เป็น `File`/`Blob` (ไม่ใช่ data URL string)
- [ ] เอา limit 20MB เดิมออก/ปรับให้ตรง policy ใหม่ (5MB ตาม T12) — ใช้ constants เดียวกัน
- [ ] ทดสอบ: ไฟล์ใหญ่เข้า → ได้ Blob ขนาดเล็กลง → upload ผ่าน T12
- [ ] ตรวจ grep `toDataURL` ใน `src/utils/` → อนุญาตเฉพาะตอน canvas processing ภายใน ไม่ export เป็น data model

### เสร็จเมื่อ

- [ ] resize ยังทำได้
- [ ] quality/compression ยังทำได้
- [ ] storage service รับ File/Blob
- [ ] database ไม่ได้รับ Base64

### Commit

```text
feat: migrate image processing to blob pipeline
```

---

# PHASE 4 — AUTHENTICATION

---

## T14 — Enable Firebase Authentication

`[ ]` Depends: T07 · ⏱ ~30m · Files: Firebase Console

### Subtasks

- [ ] ใน Console → Authentication → Sign-in method → เปิด **Email/Password**
- [ ] ตรวจ Authorized domains มี `localhost` (สำหรับ dev)
- [ ] ยังไม่เปิด Google provider (ไว้ optional หลัง M8)
- [ ] จดบันทึกลง `docs/firebase-setup.md` (เริ่มไฟล์ — ต่อใน T51)

### เสร็จเมื่อ

- [ ] register / login เรียก Firebase Auth ได้ (ทดสอบจริงใน T17/T18)
- [ ] auth state persistence เปิดค่า default
- [ ] invalid credentials ให้ error จาก Firebase (ยังไม่มี UI — ตรวจผ่าน SDK ชั่วคราวได้)

### Commit

```text
feat: enable email password authentication
```

---

## T15 — Create AuthContext

`[ ]` Depends: T14 · ⏱ ~1h · Files: `src/context/AuthContext.jsx`

### Subtasks

- [ ] สร้าง `src/context/AuthContext.jsx` — `AuthProvider` + `useAuth()`
- [ ] `onAuthStateChanged` → `setUser` + `setLoading(false)`
- [ ] implement `logout()` → `signOut(auth)`
- [ ] wrap `App.jsx` ด้วย `<AuthProvider>`
- [ ] เพิ่ม `useAuth.js` re-export ใน `src/hooks/` ถ้าต้องการให้ import จาก hooks
- [ ] ทดสอบ: refresh ระหว่าง login อยู่ → session อยู่
- [ ] ทดสอบ: `loading === true` ตอน boot แล้วค่อยเป็น `false` (แยกจาก `user === null`)

### เสร็จเมื่อ

- [ ] `user` update เมื่อ login/logout
- [ ] refresh แล้ว session ถูกตรวจสอบ
- [ ] loading state แยกจาก unauthenticated state

### Commit

```text
feat: add auth context provider
```

---

## T16 — Protected Routes

`[ ]` Depends: T15 · ⏱ ~1h · Files: `src/components/auth/ProtectedRoute.jsx`

### Subtasks

- [ ] สร้าง `src/components/auth/ProtectedRoute.jsx`
- [ ] behavior: `loading` → แสดง loading state; `!user` → `<Navigate to="/login" state={{ from }} />`; `user` → render children
- [ ] ครอบ routes ทั้งหมดใน `App.jsx` ยกเว้น `/login`, `/register`
- [ ] หน้า Login ถ้า login แล้ว → redirect กลับ `location.state.from` (ทดสอบจาก `/projects/new`)
- [ ] ทดสอบ 4 หน้า: dashboard, create, detail, edit — เปิดโดยไม่ login ต้องไม่เห็น

### เสร็จเมื่อ

- [ ] หน้า protected ทั้ง 4 เปิดไม่ได้โดยไม่ login
- [ ] login แล้วกลับไป route เดิมที่ต้องการได้

### Commit

```text
feat: add protected routes
```

---

## T17 — Login Page

`[ ]` Depends: T16 · ⏱ ~1–2h · Files: `src/pages/Login.jsx`

### Subtasks

- [ ] สร้าง `src/pages/Login.jsx` — form: email, password, ปุ่ม Login, ลิงก์ไป Register
- [ ] local validation: email required + รูปแบบ, password required
- [ ] `signInWithEmailAndPassword` + state `isSubmitting` + error message ภาษาอ่านง่าย
- [ ] map error code → ข้อความ (`invalid-credential` / `invalid-email` / `network-request-failed`)
- [ ] disabled ปุ่มระหว่าง submit, แสดง "กำลังเข้าสู่ระบบ..."
- [ ] ทดสอบ: login success → redirect กลับหน้าเดิม; login failure → ข้อความผิดชัดเจน
- [ ] ทดสอบ: กด submit ซ้ำ ๆ ระหว่างรอ → ไม่ยิง request หลายครั้ง

### เสร็จเมื่อ

- [ ] login success / failure ทำงาน
- [ ] disabled button ระหว่าง submitting
- [ ] validation ครบ

### Commit

```text
feat: add login page
```

---

## T18 — Register Page

`[ ]` Depends: T17 · ⏱ ~1–2h · Files: `src/pages/Register.jsx`

### Subtasks

- [ ] สร้าง `src/pages/Register.jsx` — email, password, confirm password, ปุ่ม Register, ลิงก์ไป Login
- [ ] validation: email required, password required, confirm ต้องตรงกัน (message ภาษาไทย)
- [ ] `createUserWithEmailAndPassword` + error mapping (`email-already-in-use` → "อีเมลนี้ถูกใช้แล้ว")
- [ ] state `isSubmitting` + disabled ปุ่มระหว่างรอ
- [ ] สำเร็จ → redirect ตาม ProtectedRoute (ไปหน้าที่ตั้งใจเข้า หรือ `/`)
- [ ] ทดสอบ: register ซ้ำ → error ชัด; password ไม่ตรง → ไม่ยิง request

### เสร็จเมื่อ

- [ ] register สำเร็จ/ล้มเหลว ทำงาน
- [ ] validation ครบ (email/password/confirm)
- [ ] error ภาษาอ่านง่าย

### Commit

```text
feat: add register page
```

---

# PHASE 5 — REACT STATE / FEATURE MIGRATION

---

## T19 — Replace state.js With React Hook

`[ ]` Depends: T18 · ⏱ ~30m · Files: design note + `src/hooks/` skeleton

### Subtasks

- [ ] อ่าน `src/js/state.js` → ไล่ทุก state ที่มี (`projects`, `currentEditId`, `currentDetailId`, `tempBase64Image`, theme) แล้วจด mapping ว่าตัวไหนไปอยู่ไหน:
  - `projects` → `useProjects`
  - `currentEditId`/`currentDetailId` → React Router params
  - `tempBase64Image` → component-local File state
  - theme → `useTheme` (T/UI-11)
- [ ] สร้าง skeleton `src/hooks/useProjects.js` (ยัง implement จริงที่ T20)
- [ ] ยืนยัน: ไม่มี `window.State` ในโค้ด React ใหม่
- [ ] ยืนยัน: project data ไม่พึ่ง `localStorage` (theme ยังใช้ได้ตามแผน)

### เสร็จเมื่อ

- [ ] React state เป็น source ของ UI state
- [ ] Firestore เป็น source ของ persisted data
- [ ] localStorage ไม่จำเป็นสำหรับ project database

### Commit

```text
refactor: plan state migration to react hooks
```

---

## T20 — Create useProjects

`[ ]` Depends: T19 · ⏱ ~1–2h · Files: `src/hooks/useProjects.js`

### Subtasks

- [ ] implement hook: `useAuth()` → `user.uid` → `getProjects(uid)` → `setProjects`
- [ ] expose: `projects`, `loading`, `error`, `create`, `update`, `remove`, `refresh`
- [ ] `create(data)` เรียก `createProject` แล้ว optimistic append หรือ refresh
- [ ] `update(id, data)` อัปเดต list ทันที
- [ ] `remove(id)` เอาออกจาก list ทันที
- [ ] reset `projects` เป็น `[]` เมื่อ logout (`user === null`)
- [ ] error ทุกตัว expose ให้ page (ไม่กลืนเงียบ)
- [ ] ทดสอบ: create/update/delete แล้ว UI เปลี่ยนโดยไม่ต้อง refresh
- [ ] ทดสอบ: login คนละ account → เห็นเฉพาะข้อมูลตัวเอง

### เสร็จเมื่อ

- [ ] fetch on authenticated user
- [ ] reset when logout
- [ ] create/update/delete อัปเดต UI
- [ ] errors expose ให้ page

### Commit

```text
feat: add useProjects hook
```

---

## T21 — Dashboard Page Migration

`[ ]` Depends: T20 · ⏱ ~0.5–1d · Files: `src/pages/Dashboard.jsx` + `src/components/dashboard/*`

### Subtasks

- [ ] สร้าง `src/pages/Dashboard.jsx` (เปลี่ยน placeholder route `/`)
- [ ] สร้าง `DashboardHeader.jsx` — ชื่อ app + ปุ่ม "โปรเจกต์ใหม่" → `/projects/new`
- [ ] สร้าง `StatsCards.jsx` — รับ stats จาก T22
- [ ] สร้าง `SearchBar.jsx` — state `search` + input
- [ ] สร้าง `StatusFilter.jsx` — state `status` + dropdown จาก constants
- [ ] สร้าง `ProjectGrid.jsx` — map projects + key stable
- [ ] สร้าง `ProjectCard.jsx` — image, charName, seriesName, status, budget, จำนวน item, คลิก → detail
- [ ] wire search + filter เข้า `filterProjects()` (T23) แล้วแสดงผล
- [ ] เพิ่ม state: loading (`Loading`), empty (`EmptyState` ยังไม่มีก็ inline ก่อน), error + retry
- [ ] ทดสอบ: projects load, stats, search, filter, empty, loading, error

### เสร็จเมื่อ

- [ ] projects load / stats display / search / filter ทำงาน
- [ ] empty / loading / error states ครบ

### Commit

```text
feat: migrate dashboard
```

---

## T22 — Statistics Calculation

`[ ]` Depends: T21 (คู่กัน) · ⏱ ~30m · Files: `src/utils/projectStats.js`

### Subtasks

- [ ] สร้าง `src/utils/projectStats.js` — `calculateStats(projects)` return `{ total, active, completed, budgetTotal }`
- [ ] กำหนดนิยาม `active` (status = active? หรือไม่ใช่ completed/cancelled) จาก `docs/legacy-behavior.md`
- [ ] ใช้ `Number()` กันค่า budget ที่เป็น string/undefined → รวมไม่พัง
- [ ] เขียน test หรือ console assertion: array ว่าง → ทุกค่า 0; มีข้อมูล → ถูกต้อง
- [ ] wire เข้า `StatsCards` ใน Dashboard

### เสร็จเมื่อ

- [ ] ไม่เรียก Firestore
- [ ] ไม่แก้ state (pure function)
- [ ] ผลลัพธ์ testable

### Commit

```text
feat: add project stats utility
```

---

## T23 — Search and Filter Logic

`[ ]` Depends: T21 (คู่กัน) · ⏱ ~30m · Files: `src/utils/projectFilters.js`

### Subtasks

- [ ] สร้าง `src/utils/projectFilters.js` — `filterProjects(projects, { search, status })`
- [ ] search fields: `charName`, `seriesName`, `note` — ทั้ง 3 ตัว
- [ ] case-insensitive + trim
- [ ] empty search → คืนทุกตัว; empty status → คืนทุกตัว
- [ ] search + status ทำงานพร้อมกัน (AND)
- [ ] เทียบกับ `UI.renderProjects()` เดิม → behavior ไม่ย้อนแย้ง
- [ ] wire เข้า Dashboard แล้วทดสอบค้นหาจริง

### เสร็จเมื่อ

- [ ] case-insensitive search
- [ ] empty search/status returns all
- [ ] search + status ทำงานพร้อมกัน

### Commit

```text
feat: add project search and filter utility
```

---

## T24 — Create Project Page

`[ ]` Depends: T20–T23 · ⏱ ~1d · Files: `src/pages/CreateProject.jsx` + `src/components/project/*`

### Subtasks

- [ ] สร้าง `src/pages/CreateProject.jsx` ที่ route `/projects/new`
- [ ] สร้าง `ProjectForm.jsx` — form state: charName, seriesName, budget, status, note, image, items[]
- [ ] สร้าง `StatusSelect.jsx` — ใช้ `PROJECT_STATUS` + labels
- [ ] สร้าง `ImageUploader.jsx` — เลือกไฟล์ → preview ผ่าน local object URL → เก็บเป็น File state (ชั่วคราว ใช้ T13 process ก่อน upload)
- [ ] สร้าง `ItemList.jsx` + `ItemForm.jsx` — add/edit/remove item ใน form state
- [ ] wire validation (T28 — ถ้ายังไม่ถึง ให้ใช้ check พื้นฐานก่อน แล้วมาแทนด้วย `validateProject` เมื่อถึง T28)
- [ ] Flow submit: validate → `createProject` → ได้ id → ถ้ามีรูป `uploadProjectImage` → `updateProject({ imageUrl })` → `navigate('/projects/:id')`
- [ ] กัน double submit: `isSubmitting` + disabled ปุ่ม (proper fix ที่ T33)
- [ ] ทดสอบ: create ไม่มีรูป / มีรูป / มี items / validation กัน submit / กดซ้ำไม่สร้าง 2 รายการ

### เสร็จเมื่อ

- [ ] create without image / with image / with items ผ่าน
- [ ] validation prevents invalid submit
- [ ] double submit prevented

### Commit

```text
feat: migrate create project page
```

---

## T25 — Edit Project Flow

`[ ]` Depends: T24 · ⏱ ~0.5–1d · Files: `src/pages/EditProject.jsx` (หรือ reuse `CreateProject` เป็น `ProjectFormPage`)

### Subtasks

- [ ] เพิ่ม route `/projects/:id/edit`
- [ ] load project ด้วย `getProject(id)` → ถ้าไม่พบ → not-found state (ต่อ T35)
- [ ] populate form ด้วยค่าเดิมทุก field รวม items[]
- [ ] implement submit → `updateProject(id, data)` (ไม่สร้าง doc ใหม่)
- [ ] image: คงค่าเดิมถ้าไม่เลือกใหม่; ถ้าเลือกใหม่ → upload → update `imageUrl` (optionally ลบไฟล์เก่าด้วย `deleteProjectImage`)
- [ ] ตรวจ `updatedAt` เปลี่ยนจริง
- [ ] ทดสอบ: existing values populate, แก้ได้, รูปคงเดิม/เปลี่ยนได้, updatedAt เปลี่ยน

### เสร็จเมื่อ

- [ ] ค่าเดิม populate ครบ
- [ ] image remain unchanged / replace ได้
- [ ] updatedAt changes

### Commit

```text
feat: migrate edit project flow
```

---

## T26 — Project Detail Page

`[ ]` Depends: T25 · ⏱ ~0.5–1d · Files: `src/pages/ProjectDetail.jsx` + `src/components/project/*`

### Subtasks

- [ ] สร้าง `src/pages/ProjectDetail.jsx` ที่ `/projects/:id`
- [ ] `ProjectHero.jsx` — image พร้อม fallback ถ้าไม่มีรูป
- [ ] `ProjectInfo.jsx` — charName, seriesName, budget, item count
- [ ] `ProjectStatus.jsx` — badge จาก constants
- [ ] `ProjectNote.jsx` — note (รองรับยาว ไม่พัง layout)
- [ ] `ProjectItems.jsx` — รายชื่อ item + price + เปิด `shopLink` (ใช้ `rel="noopener noreferrer"` + `target="_blank"` — เสริมความปลอดภัย T31)
- [ ] Actions: Back (navigate -1 หรือ `/`), Edit (→ `/projects/:id/edit`), Delete (confirm ก่อน → ใช้ ConfirmDialog เมื่อถึง UI-08, ชั่วคราว `window.confirm`)
- [ ] not-found state เมื่อ id ผิด/ถูกลบ
- [ ] ทดสอบ: detail loads, 404, image fallback, items, links, edit nav, delete flow

### เสร็จเมื่อ

- [ ] detail loads / not-found / image fallback
- [ ] item list + shop links
- [ ] edit navigation + delete flow

### Commit

```text
feat: migrate project detail page
```

---

## T27 — Item Management

`[ ]` Depends: T26 · ⏱ ~0.5d · Files: `ItemList.jsx`, `ItemForm.jsx`, validation

### Subtasks

- [ ] ยืนยัน item model ตรง schema: `name`, `price`, `shopLink`, `category`
- [ ] UI actions: Add / Edit / Remove ครบทั้งใน create และ edit form
- [ ] validation: `name` required, `price >= 0`, `shopLink` เป็น URL ถ้ากรอก (เชื่อม T28/T31)
- [ ] state จัดการ item array ถูกต้อง (แก้ตัวเดียวไม่กระทบตัวอื่น, key stable)
- [ ] ตรวจ: budget ของโปรเจกต์ independent จากผลรวม item (除非ออกแบบไว้) — ถ้าอยากแสดง "รวมค่า item" ให้เป็น display แยก
- [ ] ทดสอบ: เพิ่มหลายตัว, แก้, ลบ, validation

### เสร็จเมื่อ

- [ ] multiple items / edit / remove ทำงาน
- [ ] validation ครบ
- [ ] total budget independent จาก item sum

### Commit

```text
feat: add item management
```

---

# PHASE 6 — UI REDESIGN

---

## UI-01 — Design System

`[ ]` Depends: M4 จบ (feature parity) · ⏱ ~0.5–1d · Files: `src/styles/*`

### Subtasks

- [ ] สร้าง `src/styles/tokens.css` — CSS variables: `--color-*`, `--font-size-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--border-*`, `--breakpoint-*`
- [ ] สร้าง `src/styles/globals.css` — reset, base typography, focus ring
- [ ] สร้าง `src/styles/layout.css` — container/grid helpers
- [ ] สร้าง `src/styles/components.css` — คลาส component หลัก
- [ ] สร้าง `src/styles/index.css` — import ทั้งหมด + ย้าย `src/style.css` เดิมเข้ามา (หรือลบถ้าแทนที่หมดแล้ว)
- [ ] นิยาม dark/light ด้วย `[data-theme="dark"]` overrides (สอดคล้อง UI-11)
- [ ] เก็บ palette + ค่า contrast ที่ผ่านเกณฑ์
- [ ] ตรวจ: ไม่มี `#hex` สุ่มกระจายใน component (grep ตรวจ)

### เสร็จเมื่อ

- [ ] ไม่มี random color ใน component
- [ ] spacing ใช้ design tokens
- [ ] typography consistent
- [ ] dark/light strategy defined

### Commit

```text
feat: add design system tokens
```

---

## UI-02 — Global Layout

`[ ]` Depends: UI-01 · ⏱ ~0.5d · Files: `src/components/layout/{Layout,Header,Sidebar,MobileNav}.jsx`

### Subtasks

- [ ] สร้าง `Layout.jsx` — header + sidebar + main (ตาม ASCII layout ในแผน)
- [ ] สร้าง `Header.jsx` — brand, ThemeToggle slot, auth menu (ชื่อ user / logout)
- [ ] สร้าง `Sidebar.jsx` — nav desktop (Dashboard, New Project)
- [ ] สร้าง `MobileNav.jsx` — bottom nav สำหรับ mobile
- [ ] ครอบ Routes ทั้งหมดใน `App.jsx` ด้วย `Layout`
- [ ] responsive: desktop แสดง sidebar, mobile ซ่อนแล้วใช้ bottom nav
- [ ] ทดสอบที่ 390 / 768 / 1024 / 1440 px

### เสร็จเมื่อ

- [ ] desktop / tablet / mobile ใช้งานได้
- [ ] navigation consistent ทุกหน้า

### Commit

```text
feat: add responsive global layout
```

---

## UI-03 — Dashboard Redesign

`[ ]` Depends: UI-02 · ⏱ ~0.5–1d · Files: dashboard components

### Subtasks

- [ ] จัดลำดับ: Header → Stats → Search → Filter → Grid → Empty State
- [ ] visual hierarchy — ปุ่ม "โปรเจกต์ใหม่" เป็น primary action ชัดเจน
- [ ] stats cards อ่านง่าย (ตัวเลขเด่น, label ชัด)
- [ ] responsive project grid (1 คอลัมน์บน mobile, multi-column บน desktop)
- [ ] ตรวจ: ใช้งานได้โดยไม่ต้อง hover, focus มองเห็น, ไม่มี horizontal overflow
- [ ] ทดสอบ keyboard: tab ผ่าน search → filter → cards → ปุ่มหลักได้

### เสร็จเมื่อ

- [ ] usable without hover
- [ ] keyboard focus visible
- [ ] mobile layout ใช้ได้
- [ ] ไม่มี horizontal overflow

### Commit

```text
feat: redesign dashboard
```

---

## UI-04 — Project Card Redesign

`[ ]` Depends: UI-03 · ⏱ ~0.5d · Files: `ProjectCard.jsx`

### Subtasks

- [ ] card แสดงครบ: image, character, series, status, budget, item count, updated time, actions
- [ ] states: normal / hover / focus / loading
- [ ] image fallback เมื่อไม่มีรูป
- [ ] long title / long series ไม่ล้น card (truncate/line-clamp)
- [ ] ปุ่ม action บน card ไม่ bubble ไป trigger การเปิด card (stopPropagation)
- [ ] ทดสอบ keyboard: focus เข้าถึงได้, Enter เปิด detail
- [ ] แสดง updated time ด้วย formatter (`src/utils/formatters.js` — สร้างถ้ายังไม่มี)

### เสร็จเมื่อ

- [ ] card อ่านได้กับข้อความยาว
- [ ] image มี fallback
- [ ] action ไม่เปิด card ผิดจังหวะ
- [ ] keyboard accessible

### Commit

```text
feat: redesign project card
```

---

## UI-05 — Project Form Redesign

`[ ]` Depends: UI-03 · ⏱ ~0.5–1d · Files: `ProjectForm.jsx` + form components

### Subtasks

- [ ] จัด sections: Character → Image → Budget/Status → Items → Note → Actions
- [ ] label ทุก field + required indicator
- [ ] validation message แสดงใต้ field ที่ผิด (เชื่อม T28)
- [ ] disabled submit state เมื่อ validation ไม่ผ่าน / กำลัง submitting
- [ ] upload progress indicator สำหรับ image
- [ ] save error แสดงชัด (inline หรือ toast เมื่อถึง UI-09)
- [ ] ตรวจ: tab order 逻辑, mobile ใช้ได้, error ไม่ทำ layout shift
- [ ] ทดสอบ form บน 390px

### เสร็จเมื่อ

- [ ] tab order logical
- [ ] validation ข้าง field
- [ ] mobile friendly
- [ ] ไม่มี layout shift ตอนแสดง error

### Commit

```text
feat: redesign project form
```

---

## UI-06 — Image Uploader Redesign

`[ ]` Depends: UI-05 · ⏱ ~0.5d · Files: `ImageUploader.jsx`

### Subtasks

- [ ] states ครบ: empty, drag over, selected, uploading, uploaded, error, replace, remove
- [ ] constraints แสดงให้ user เห็น: JPG/PNG/WEBP, max 5MB (ใช้ constants T09)
- [ ] preview รูปก่อน/หลัง upload
- [ ] progress bar ระหว่าง upload (ใช้ `uploadBytesResumable` ถ้าต้องการ progress จริง)
- [ ] ปุ่ม replace + remove ทำงาน (เรียก `deleteProjectImage` เมื่อ remove รูปที่ upload แล้ว)
- [ ] error state: ไฟล์ใหญ่เกิน / ชนิดผิด / network fail → ข้อความชัด
- [ ] ทดสอบครบทุก state

### เสร็จเมื่อ

- [ ] preview / upload progress / error / replace / remove ครบ

### Commit

```text
feat: redesign image uploader
```

---

## UI-07 — Project Detail Redesign

`[ ]` Depends: UI-06 · ⏱ ~0.5d · Files: detail components

### Subtasks

- [ ] จัดลำดับ: Back → Hero Image → Character/Series → Status → Budget → Items → Note → Actions
- [ ] ข้อมูลสำคัญ (character, status, budget) อยู่บนสุด
- [ ] actions (Edit/Delete/Back) หาง่าย ไม่จม
- [ ] mobile layout อ่านง่าย (single column)
- [ ] long note ไม่แตก layout (wrap/scroll)
- [ ] ทดสอบบน 390px

### เสร็จเมื่อ

- [ ] ข้อมูลสำคัญมาก่อน
- [ ] actions หาเจอง่าย
- [ ] mobile อ่านได้
- [ ] long note ไม่พัง layout

### Commit

```text
feat: redesign project detail
```

---

## UI-08 — Modal / Confirmation System

`[ ]` Depends: UI-07 · ⏱ ~0.5d · Files: `src/components/common/{Modal,ConfirmDialog}.jsx`

### Subtasks

- [ ] สร้าง `Modal.jsx` — overlay, content slot, close handler
- [ ] สร้าง `ConfirmDialog.jsx` — message, cancel, confirm (destructive สี danger แยกจาก cancel)
- [ ] Escape ปิด (เมื่อ appropriate), focus ย้ายเข้า dialog และกลับ element เดิมตอนปิด
- [ ] click outside → define แล้วทำให้ consistent (ปิด หรือ ไม่ปิด — เลือกอย่างใดอย่างหนึ่ง)
- [ ] ใช้จริง: delete project, remove item, replace image (แทน `window.confirm` ที่ T26 ทำไว้)
- [ ] ทดสอบ keyboard: tab ไม่หลุดออกจาก dialog (focus trap)

### เสร็จเมื่อ

- [ ] escape / focus behavior เหมาะสม
- [ ] destructive action แยกชัด
- [ ] click outside ปฏิบัติตามที่กำหนด

### Commit

```text
feat: add modal and confirm dialog
```

---

## UI-09 — Toast System

`[ ]` Depends: UI-08 · ⏱ ~0.5d · Files: `src/components/common/Toast.jsx` + hook/context

### Subtasks

- [ ] สร้าง `Toast.jsx` — types: success, error, warning, info
- [ ] สร้าง `ToastContext` + `useToast()` (หรือ `useToast` ง่าย ๆ ที่ manage queue)
- [ ] auto dismiss (success/info สั้น, error นานกว่า)
- [ ] ไม่บัง UI (มุมจอ, มี close button)
- [ ] wire เข้า: save สำเร็จ, upload สำเร็จ, error ทั่วไป, ลบแล้ว
- [ ] accessible: error สำคัญประกาศผ่าน `role="alert"` หรือ `aria-live`

### เสร็จเมื่อ

- [ ] auto dismiss / readable / ไม่ block UI
- [ ] error เข้าถึงได้ทาง accessibility

### Commit

```text
feat: add toast notification system
```

---

## UI-10 — Loading / Empty / Error States

`[ ]` Depends: UI-09 · ⏱ ~0.5d · Files: `Loading.jsx`, `EmptyState.jsx`, `ErrorMessage.jsx`

### Subtasks

- [ ] สร้าง `Loading.jsx` (spinner/skeleton)
- [ ] สร้าง `EmptyState.jsx` (ข้อความ + action เช่น "สร้างโปรเจกต์แรก")
- [ ] สร้าง `ErrorMessage.jsx` (ข้อความ + ปุ่ม retry)
- [ ] wire: Dashboard loading/empty/error
- [ ] wire: Detail loading/not found/error
- [ ] wire: Form submitting, Image uploading
- [ ] ไล่ตรวจทุก async operation ใน app → มี feedback ครบ

### เสร็จเมื่อ

- [ ] ทุก async operation มี feedback

### Commit

```text
feat: add loading empty error states
```

---

## UI-11 — Theme Migration

`[ ]` Depends: UI-10 · ⏱ ~0.5d · Files: `src/hooks/useTheme.js`, `src/components/layout/ThemeToggle.jsx`

### Subtasks

- [ ] อ่านพฤติกรรมเดิมจาก `docs/legacy-behavior.md` (localStorage key, `data-theme`, prefers-color-scheme)
- [ ] สร้าง `useTheme.js` — detect system preference เป็นค่าเริ่มต้น
- [ ] persist ธีมใน localStorage key เดิม (`cosplay-theme`) เพื่อให้ user เดิมไม่ตั้งใหม่
- [ ] สร้าง `ThemeToggle.jsx` — light/dark/system
- [ ] prevent flash: ตั้ง `data-theme` ใน `<head>` script ก่อน render (inline script ใน `index.html`)
- [ ] wire เข้า Header (UI-02)
- [ ] ทดสอบ: light, dark, system preference, persist หลัง refresh

### เสร็จเมื่อ

- [ ] light / dark / system ทำงาน
- [ ] setting persist
- [ ] flash ลดลงเท่าที่ทำได้

### Commit

```text
feat: migrate theme system
```

---

## UI-12 — Responsive & Accessibility Pass

`[ ]` Depends: UI-11 · ⏱ ~1d · Files: fix commits ตามที่เจอ

### Subtasks

- [ ] ทดสอบทุกหน้าที่ 5 breakpoints: 390, 768, 1024, 1280, 1440
- [ ] ไม่มี horizontal scroll ที่ 390px
- [ ] ทุก interactive control เข้าถึงด้วย keyboard ได้
- [ ] form labels connect กับ inputs (`htmlFor`/`id`)
- [ ] visible focus state ทุกปุ่ม/ลิงก์
- [ ] images มี alt text ที่มีความหมาย
- [ ] contrast ผ่านเกณฑ์ทั้ง light/dark
- [ ] touch target ≥ 44px บน mobile
- [ ] แก้ทุก issue ที่เจอเป็น commit แยก

### เสร็จเมื่อ

- [ ] no horizontal scroll ที่ 390px
- [ ] controls keyboard reachable ครบ
- [ ] labels connected
- [ ] focus visible
- [ ] alt text ครบ

### Commit

```text
fix: responsive and accessibility pass
```

---

# PHASE 7 — VALIDATION / SECURITY

---

## T28 — Project Validation

`[ ]` Depends: M4 พร้อมใช้ (จริง ๆ เริ่มได้ตั้งแต่ T24) · ⏱ ~1h · Files: `src/utils/validation.js`

### Subtasks

- [ ] สร้าง `src/utils/validation.js` — `validateProject(data)` return `errors` object
- [ ] rules: charName required, seriesName required, budget ≥ 0, status อยู่ใน allowed values
- [ ] เพิ่ม `validateItem(item)` — name required, price ≥ 0, shopLink URL ถ้ามี
- [ ] messages ภาษาไทยที่บอกว่าต้องแก้อะไร
- [ ] แทน check ชั่วคราวใน T24/T25/T27 ให้ใช้ตัวนี้ตัวเดียว (shared create/edit)
- [ ] ทดสอบ: invalid data ถูก block พร้อม message ถูก field

### เสร็จเมื่อ

- [ ] invalid data blocked
- [ ] useful messages
- [ ] validation ใช้ร่วมกันระหว่าง create/edit

### Commit

```text
feat: add project validation
```

---

## T29 — Firestore Security Rules

`[ ]` Depends: T28 · ⏱ ~1–2h · Files: `firestore.rules`

### Subtasks

- [ ] เขียน `firestore.rules` — create: `request.auth != null && request.resource.data.ownerId == request.auth.uid`
- [ ] read/update/delete: `resource.data.ownerId == request.auth.uid`
- [ ] ห้ามมี `allow read, write: if true`
- [ ] `firebase deploy --only firestore:rules`
- [ ] ทดสอบด้วย Firebase Emulator หรือ account จริง 2 บัญชี:
  - anonymous cannot read ❌
  - User A read own ✅ / User B ❌
  - User A update own ✅ / User B ❌
  - User A delete own ✅ / User B ❌
  - create ที่ ownerId ≠ auth.uid ❌
- [ ] จดผลลง `docs/security-test.md` (เริมไฟล์ — ต่อใน T46)

### เสร็จเมื่อ

- [ ] ทุกข้อใน security test ผ่านตาม expected
- [ ] rules commit + deploy แล้ว

### Commit

```text
feat: add firestore security rules
```

---

## T30 — Storage Security Rules

`[ ]` Depends: T29 · ⏱ ~1h · Files: `storage.rules`

### Subtasks

- [ ] เขียน `storage.rules` — path `users/{userId}/...` ต้องมี `request.auth.uid == userId`
- [ ] enforce contentType เป็น image/* และ size ≤ 5MB
- [ ] `firebase deploy --only storage:rules`
- [ ] ทดสอบ: upload ของตัวเอง ✅ / upload path ของคนอื่น ❌ / anonymous ❌ / ไฟล์ใหญ่เกิน ❌ / ชนิดผิด ❌
- [ ] จดผลลง `docs/security-test.md`

### เสร็จเมื่อ

- [ ] user upload own image ได้
- [ ] upload path คนอื่น / anonymous ถูกปฏิเสธ
- [ ] oversized/unsupported ถูกจัดการ

### Commit

```text
feat: add storage security rules
```

---

## T31 — URL / External Link Safety

`[ ]` Depends: T30 · ⏱ ~1h · Files: `src/utils/validation.js` + link rendering

### Subtasks

- [ ] เพิ่ม `isValidUrl(url)` — parse ด้วย `new URL()` + บังคับ `http:`/`https:` เท่านั้น
- [ ] block `javascript:`, `data:`, `vbscript:` ( reject ถ้าไม่ผ่าน scheme)
- [ ] ใช้ validate ใน `validateItem` (T28)
- [ ] ตอน render: `target="_blank"` + `rel="noopener noreferrer"` ทุก shop link
- [ ] ทดสอบ: valid URL เปิดได้ / invalid ถูกกัน / `javascript:alert(1)` ไม่ถูก accept

### เสร็จเมื่อ

- [ ] valid URL เปิดได้
- [ ] invalid URL ถูกกัน
- [ ] ไม่มี dangerous scheme ถูก accept

### Commit

```text
feat: validate external links
```

---

# PHASE 8 — ERROR HANDLING / UX HARDENING

---

## T32 — Central Error Handling Strategy

`[ ]` Depends: T31 · ⏱ ~1–2h · Files: `src/utils/errors.js`

### Subtasks

- [ ] สร้าง `src/utils/errors.js` — `toUserMessage(error)` map Firebase codes (`permission-denied`, `unavailable`, `not-found`, `quota-exceeded`, `storage/unauthorized`, `storage/unknown`) เป็นข้อความไทย
- [ ] pattern: service throw → hook catch/expose → page เลือก UI → Toast/ErrorMessage
- [ ] ตรวจทุก service/hook: error ถูก catch และ expose ไม่กลืนเงียบ
- [ ] console ยังคง log ข้อมูล developer ไว้ (`console.error` ต้นทาง)
- [ ] ไม่มีที่ไหนแสดง stack trace ยาว ๆ ให้ user
- [ ] ทดสอบ: trigger error แต่ละชนิด → user เห็นข้อความที่อ่านออก

### เสร็จเมื่อ

- [ ] Firebase error ถูก map เป็น readable message
- [ ] console มีข้อมูล developer
- [ ] user ได้ feedback เสมอ

### Commit

```text
feat: add central error handling
```

---

## T33 — Prevent Duplicate Submit

`[ ]` Depends: T32 · ⏱ ~30m · Files: form pages

### Subtasks

- [ ] สร้าง/ใช้ state `isSubmitting` ใน Create/Edit/Register/Login
- [ ] disabled ปุ่ม submit ระหว่าง request + label "กำลังบันทึก..."
- [ ] reset state ทั้งตอน success และ failure
- [ ] ทดสอบ double-click ซ้ำ ๆ → สร้าง project ได้แค่ 1 รายการ

### เสร็จเมื่อ

- [ ] double-click ไม่สร้าง 2 records
- [ ] submit disabled ระหว่าง request
- [ ] state reset ถูกต้อง

### Commit

```text
feat: prevent duplicate submit
```

---

## T34 — Handle Offline / Network Failure

`[ ]` Depends: T33 · ⏱ ~1h · Files: Dashboard, forms

### Subtasks

- [ ] Dashboard: network error → `ErrorMessage` + ปุ่ม retry (`refresh()`)
- [ ] Create/Edit: error แล้ว form data ไม่หาย (ไม่ reset state)
- [ ] Image upload: error ชัดเจน + ลองใหม่ได้
- [ ] map `unavailable`/`network-request-failed` ผ่าน `toUserMessage`
- [ ] ทดสอบ: ปิด network ระหว่างใช้งาน (DevTools offline) → ทุกกรณีมี feedback ไม่ crash

### เสร็จเมื่อ

- [ ] dashboard error มี retry
- [ ] create error ไม่ทำให้ form data หาย
- [ ] upload error แจ้งชัดเจน

### Commit

```text
feat: handle offline and network failure
```

---

## T35 — Not Found / Invalid Route

`[ ]` Depends: T34 · ⏱ ~1h · Files: `src/pages/NotFound.jsx`, catch-all route

### Subtasks

- [ ] สร้าง `src/pages/NotFound.jsx` (custom 404)
- [ ] เพิ่ม catch-all route `path="*"` → NotFound
- [ ] ProjectDetail: not-found state เมื่อ `getProject` throw "Project not found"
- [ ] malformed id: จับ error ไม่ให้ uncaught (Firestore จะ reject id ที่ผิดรูป — ต้อง catch)
- [ ] ทดสอบ 4 cases: unknown route, missing project, deleted project, malformed id
- [ ] ตรวจไม่มี runtime crash ใน console

### เสร็จเมื่อ

- [ ] custom 404 page
- [ ] project not found state
- [ ] ไม่มี uncaught runtime crash

### Commit

```text
feat: add not found handling
```

---

# PHASE 9 — CLEANUP / LEGACY REMOVAL

> ⚠️ Phase นี้เริ่มได้เมื่อ M4–M6 ผ่าน acceptancetests ครบแล้ว

---

## T36 — Stop Using Legacy API

`[ ]` Depends: T35 + M6 ผ่าน · ⏱ ~30m · Files: `src/`, `index.html`

### Subtasks

- [ ] `grep -R "window.API\|API\.list\|API\.get\|GAS_URL" src index.html`
- [ ] ลบ/แทน reference ที่เจอทั้งหมด
- [ ] ยืนยันไม่มี `fetch` ไป Apps Script URL
- [ ] รัน app ทดสอบ flow หลัก CRUD ยังทำงาน

### เสร็จเมื่อ

- [ ] no frontend reference to GAS
- [ ] no GAS URL in source
- [ ] no fetch to Apps Script

### Commit

```text
refactor: remove legacy api references
```

---

## T37 — Stop Using Legacy State

`[ ]` Depends: T36 · ⏱ ~30m · Files: `src/`

### Subtasks

- [ ] `grep -R "window.State\|cosplayProjects\|currentEditId\|currentDetailId\|tempBase64Image" src index.html`
- [ ] ลบ reference ที่เหลือทั้งหมด
- [ ] ยืนยัน project CRUD ไม่ใช้ localStorage (ใช้ Firestore)
- [ ] ยืนยัน theme preference ยังใช้ localStorage ได้ (ตามแผน)
- [ ] reload หน้า → ข้อมูลมาจาก Firestore

### เสร็จเมื่อ

- [ ] project CRUD ไม่ใช้ localStorage
- [ ] reload อ่าน Firestore
- [ ] ไม่มี stale legacy state คุม UI

### Commit

```text
refactor: remove legacy state
```

---

## T38 — Remove Base64 Data Model

`[ ]` Depends: T37 · ⏱ ~30m · Files: `src/`

### Subtasks

- [ ] `grep -R "base64Image\|tempBase64Image\|toDataURL" src`
- [ ] `base64Image` / `tempBase64Image` ต้องหายจาก model ทั้งหมด
- [ ] `toDataURL` เหลือเฉพาะภายใน canvas processing (ถ้ามี) ไม่ export เป็น data model
- [ ] display รูปด้วย storage `imageUrl` เท่านั้น
- [ ] ตรวจ Firestore doc ตัวอย่างว่าไม่มี base64 field

### เสร็จเมื่อ

- [ ] Firestore ไม่มี Base64 image
- [ ] project object ไม่มี `base64Image`
- [ ] แสดงผลด้วย storage URL

### Commit

```text
refactor: remove base64 image model
```

---

## T39 — Remove Google Apps Script

`[ ]` Depends: T38 · ⏱ ~30m · Files: `gas/`

### Subtasks

- [ ] Verify ครบก่อนลบ: Create / Read / Update / Delete / Search / Image / Auth ผ่าน Firestore+Storage
- [ ] `git rm -r gas/`
- [ ] ตรวจ docs/README ไม่มีคำสั่งให้ deploy GAS
- [ ] รัน app หลังลบ → ทำงานปกติ

### เสร็จเมื่อ

- [ ] system ทำงานเมื่อเอา `gas/` ออก
- [ ] ไม่มี documentation บอกให้ deploy GAS

### Commit

```text
refactor: remove google apps script
```

---

## T40 — Remove Old Vanilla UI Code

`[ ]` Depends: T39 · ⏱ ~30m · Files: `src/js/*`

### Subtasks

- [ ] ยืนยัน React parity ครบ (T44 ผ่านหรืออย่างน้อย smoke test ครบ)
- [ ] `git rm src/js/app.js src/js/api.js src/js/state.js src/js/ui.js src/js/image.js`
- [ ] ตรวจไม่มี import/`<script>` ชี้ไฟล์เหล่านี้ (`grep -R "src/js" .`)
- [ ] ลบ `src/style.css` ถ้าย้ายเข้า `src/styles/` หมดแล้ว
- [ ] `npm run build` ยังผ่าน

### เสร็จเมื่อ

- [ ] React เป็น frontend implementation เดียว
- [ ] ไม่มี duplicate UI logic
- [ ] ไม่มี DOM event listener เก่า

### Commit

```text
refactor: remove vanilla js
```

---

# PHASE 10 — FIREBASE HOSTING

---

## T41 — Configure SPA Hosting

`[ ]` Depends: T40 · ⏱ ~30m · Files: `firebase.json`

### Subtasks

- [ ] ตั้ง `hosting.public = "dist"`
- [ ] เพิ่ม rewrites: `{ "source": "**", "destination": "/index.html" }`
- [ ] เพิ่ม `ignore`: `firebase.json`, `**/.*`, `**/node_modules/**`
- [ ] ทดสอบด้วย `firebase emulators:start --only hosting` หรือ deploy preview
- [ ] เช็ค 4 cases: `/`, `/projects/new`, `/projects/:id`, unknown path → React 404
- [ ] direct refresh บน `/projects/123` ต้องไม่ 404 server

### เสร็จเมื่อ

- [ ] ทุก route เปิดได้
- [ ] direct refresh ได้
- [ ] unknown path ไปถึง React 404

### Commit

```text
chore: configure firebase hosting spa
```

---

## T42 — Production Build

`[ ]` Depends: T41 · ⏱ ~30m · Files: `dist/`

### Subtasks

- [ ] `npm run build` → exit code 0
- [ ] ตรวจ `dist/` มี `index.html` + assets ครบ
- [ ] `npm run preview` → smoke test flow หลักใน production build
- [ ] ตรวจ console ไม่มี error ที่ทำให้พัง
- [ ] ตรวจ env vars ถูก resolve (ไม่มี `undefined` ใน config)
- [ ] ตรวจ bundle size คร่าว ๆ (อ้างอิง T49)

### เสร็จเมื่อ

- [ ] `npm run build` exit code = 0
- [ ] preview ใช้งานได้จริง

### Commit

```text
chore: verify production build
```

---

## T43 — Firebase Deploy

`[ ]` Depends: T42 · ⏱ ~1h · Files: production URL

### Subtasks

- [ ] `firebase deploy --only hosting` (หรือ `firebase deploy` รวม rules)
- [ ] เปิด production URL
- [ ] Smoke test ครบ: homepage, login, dashboard, create, detail, edit, delete, image, logout, refresh
- [ ] ตรวจไม่มี debug/test endpoint หลงเหลือ
- [ ] จด URL + checklist ผลลง README หรือ docs

### เสร็จเมื่อ

- [ ] production URL ใช้ได้
- [ ] SPA routes ทำงาน
- [ ] Firebase services เชื่อมต่อ
- [ ] ไม่มี debug endpoint เหลือ

### Commit

```text
chore: deploy to firebase hosting
```

---

# PHASE 11 — TESTING

---

## T44 — Manual CRUD Test

`[ ]` Depends: T43 (หรือก่อน deploy รันบน preview ก็ได้) · ⏱ ~1–2h

### Subtasks — Create

- [ ] create minimal project (charName + seriesName)
- [ ] create full project (ทุก field)
- [ ] create with image
- [ ] create with items (หลายตัว)

### Subtasks — Read

- [ ] dashboard แสดงครบ
- [ ] detail แสดงครบ
- [ ] refresh แล้วข้อมูลยังอยู่

### Subtasks — Update

- [ ] edit text
- [ ] edit status
- [ ] edit budget
- [ ] replace image
- [ ] edit items

### Subtasks — Delete

- [ ] cancel delete → ข้อมูลอยู่
- [ ] confirm delete → หาย
- [ ] project หายจาก dashboard

### เสร็จเมื่อ

- [ ] ทุกข้อใน 4 หมวด ผ่านหมด

### Commit

```text
test: manual crud test
```

---

## T45 — Authentication Test

`[ ]` Depends: T44 · ⏱ ~1h

### Subtasks

- [ ] register สำเร็จ
- [ ] register ซ้ำ (duplicate account) → error ชัด
- [ ] invalid login → error ชัด
- [ ] valid login → เข้าได้
- [ ] logout → กลับ login, ไม่เห็นข้อมูล
- [ ] refresh ระหว่าง login อยู่ → session อยู่
- [ ] refresh ระหว่าง logout → ยังอยู่หน้า login

### เสร็จเมื่อ

- [ ] ทุกข้อผ่าน

### Commit

```text
test: authentication test
```

---

## T46 — Security Test

`[ ]` Depends: T45 · ⏱ ~1–2h · Files: `docs/security-test.md`

### Subtasks

- [ ] เตรียม 2 accounts (User A, User B) + project ของแต่ละคน
- [ ] User A: read own ✅
- [ ] User A: update own ✅
- [ ] User A: delete own ✅ (คืน restore ถ้าจำเป็น)
- [ ] User A: read User B project ❌ (ลองผ่าน direct doc id)
- [ ] User A: update User B project ❌
- [ ] User A: delete User B project ❌
- [ ] anonymous: read/write Firestore ❌
- [ ] anonymous: upload Storage ❌
- [ ] User A: upload ไป path ของ User B ❌
- [ ] เขียนผล + วิธีทดสอบ ลง `docs/security-test.md`

### เสร็จเมื่อ

- [ ] ผลลัพธ์บันทึกใน `docs/security-test.md`
- [ ] ไม่มีรายการใด fail

### Commit

```text
test: document security test results
```

---

## T47 — Responsive Test

`[ ]` Depends: T46 · ⏱ ~1–2h

### Subtasks

- [ ] ทดสอบทุกหน้าที่ 390px — no horizontal overflow
- [ ] ทดสอบทุกหน้าที่ 768px
- [ ] ทดสอบทุกหน้าที่ 1024px
- [ ] ทดสอบทุกหน้าที่ 1280px
- [ ] ทดสอบทุกหน้าที่ 1440px
- [ ] ตรวจหน้า: navigation, dashboard, cards, form, detail, image upload, modal
- [ ] จด issue แล้วแก้ทันที (commit fix)

### เสร็จเมื่อ

- [ ] ทุกขนาดผ่าน checklist

### Commit

```text
test: responsive test
```

---

## T48 — Accessibility Pass

`[ ]` Depends: T47 · ⏱ ~1–2h

### Subtasks

- [ ] keyboard navigation ครบทุก critical action
- [ ] focus state มองเห็นทุกจุด
- [ ] form labels ครบ
- [ ] image alt text ครบ
- [ ] button/link semantics ถูก (`<button>` ไม่ใช่ `<div>`)
- [ ] modal focus trap ทำงาน
- [ ] contrast อ่านออกทั้ง light/dark
- [ ] จด + แก้ issue (commit fix)

### เสร็จเมื่อ

- [ ] critical actions ใช้ keyboard ได้
- [ ] controls มี labels
- [ ] alt text ครบ

### Commit

```text
test: accessibility pass
```

---

## T49 — Performance Pass

`[ ]` Depends: T48 · ⏱ ~1–2h

### Subtasks

- [ ] ตรวจ image size — รูปใหญ่ถูก process ก่อน upload (T13)
- [ ] เพิ่ม `loading="lazy"` สำหรับรูปใน grid
- [ ] ตรวจ bundle size (`npm run build` output) — ลบ dependency ที่ไม่ใช้
- [ ] ตรวจ rerender — React keys stable, ไม่มี object/function literal เป็น prop ที่ทำให้ลูก rerender โดยไม่จำเป็น
- [ ] ตรวจ search พิมพ์แต่ละตัวอักษร → ไม่ยิง Firestore ซ้ำ (filter ทำ client-side)
- [ ] ตรวจ network tab: ไม่มี repeated Firestore reads โดยไม่จำเป็น

### เสร็จเมื่อ

- [ ] images optimized
- [ ] ไม่ refetch ทุก keystroke
- [ ] React keys stable
- [ ] unused dependencies ถูกเอาออก

### Commit

```text
test: performance pass
```

---

# PHASE 12 — DOCUMENTATION

---

## T50 — Update README

`[ ]` Depends: T49 · ⏱ ~1–2h · Files: `README.md`

### Subtasks

- [ ] เขียน Project overview + feature list
- [ ] Requirements (Node, npm, Firebase account)
- [ ] Installation: `npm install`
- [ ] Environment setup: คัดลอก `.env.example` → `.env`
- [ ] Firebase setup: สร้าง project / เปิด services / ค่า config
- [ ] Development: `npm run dev`
- [ ] Build: `npm run build`
- [ ] Deploy: `firebase deploy`
- [ ] Firestore schema + Storage structure (link ไป docs)
- [ ] Security rules overview
- [ ] Migration notes (สิ่งที่เปลี่ยนจาก legacy)

### เสร็จเมื่อ

- [ ] README ครบทุกหัวข้อตามแผน

### Commit

```text
docs: update readme
```

---

## T51 — Document Firebase Setup

`[ ]` Depends: T50 · ⏱ ~1h · Files: `docs/firebase-setup.md`

### Subtasks

- [ ] Firebase project creation
- [ ] Authentication enable (Email/Password)
- [ ] Firestore enable + rules deploy
- [ ] Storage enable + rules deploy
- [ ] Hosting initialize
- [ ] Environment variables ทุกตัว
- [ ] Rules deployment commands
- [ ] Indexes (`firestore.indexes.json`)
- [ ] ผ่านจาก T06/T29/T30/T11 — รวบรวมให้ครบ

### เสร็จเมื่อ

- [ ] คนใหม่ทำตามได้ตั้งแต่ศูนย์จน deploy สำเร็จ

### Commit

```text
docs: add firebase setup guide
```

---

## T52 — Document Architecture

`[ ]` Depends: T51 · ⏱ ~1h · Files: `docs/architecture.md`

### Subtasks

- [ ] อธิบาย layers: React → Pages → Hooks → Services → Firebase SDK
- [ ] อธิบาย services: Firestore, Storage, Auth, Hosting
- [ ] แผนภาพ folder structure (มาจากต้นฉบับส่วนที่ 5)
- [ ] กฎสำคัญ: component ไม่ผูก Firestore โดยตรง, service ไม่มี DOM, ไม่มี Base64
- [ ] Legacy → New mapping (อ้างต้นฉบับส่วนที่ 6)
- [ ] ตรวจเลิกเป็น draft ที่เขียนไว้ตอน T03 แล้วอัปเดตให้ตรงของจริง

### เสร็จเมื่อ

- [ ] architecture doc ตรงกับโค้ดจริง

### Commit

```text
docs: add architecture documentation
```

---

# 附 — Execution Rules

## ห้ามทำ

```text
React + Firebase + UI redesign + Auth + Security ทั้งหมดใน commit เดียว
```

## ให้ทำ

```text
Foundation → Data → Auth → Feature parity → UI redesign
→ Security → Cleanup → Deploy
```

## Definition of Done ของทุก Task

- [ ] implementation เสร็จ
- [ ] ไม่มี blocking TODO
- [ ] acceptance criteria ผ่าน
- [ ] ไม่มี regression ใน feature ที่เกี่ยวข้อง
- [ ] ถ้ามี config/rules/schema → มี documentation
- [ ] Git commit อธิบายงานชัดเจน

## Dependency Quick Reference

```text
T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09
T10 → T11
T10 → T12 → T13
T07 → T14 → T15 → T16 → T17 → T18
T18 → T19 → T20 → T21 → (T22 ∥ T23) → T24 → T25 → T26 → T27
M4 จบ → UI-01 → UI-02 → UI-03 → (UI-04 ∥ UI-05) → UI-06 → UI-07
      → UI-08 → UI-09 → UI-10 → UI-11 → UI-12
T28 → T29 → T30 → T31 → T32 → T33 → T34 → T35
T35 + M6 ผ่าน → T36 → T37 → T38 → T39 → T40
T40 → T41 → T42 → T43 → T44 → T45 → T46 → T47 → T48 → T49
T49 → T50 → T51 → T52
```
