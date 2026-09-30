# Memory — Cosplay Planner Migration

> บันทึกความคืบหน้า งานที่เสร็จแล้ว และบริบทสำคัญ
> อัปเดตทุกครั้งที่จบ task / milestone

---

## Project Status

| | |
|---|---|
| **Location** | `Cosplay_plan/` (subdirectory ของ repo หลัก) |
| **Stack** | Vite + React 19 + **TypeScript** + react-router v8 (pnpm) |
| **Current Phase** | M7 เสร็จ + ImgBB เสร็จ + **Ant Design redesign เสร็จ (13 tasks, 2026-09-30)** — ⛔ หยุดก่อน M8 (deploy ต้องถาม user ก่อน) |
| **Current Task** | รอ user ตรวจ browser checklist 9 ข้อ + code review / คำสั่งต่อไป (M8 ต้องถามก่อน) |
| **Branch** | `migration/react-firebase` |
| **Tag** | `legacy-before-react-migration` → `bfec9e0` |
| **Last Commit** | `a92895c chore: establish react project structure` |
| **Remote** | มี origin (GitHub) แต่ยังไม่ push |

### Milestone Progress

```text
M1 React Boots     T01 ✅ T02 ✅ T03 ✅ T04 ✅ T05 ✅   → 5/5  ✅
M2 Firebase CRUD   T06 ✅ T07 ✅ T08 ✅ T09 ✅ T10 ✅
                   T11 ✅ T12 ✅ T13 ✅                 → 8/8  ✅
M3 Auth            T14 ✅ T15 ✅ T16 ✅ T17 ✅ T18 ✅   → 5/5  ✅
M4 Feature Parity  T19–T27 ✅                            → 9/9  ✅
M5 New UI          UI-01–UI-12 ✅                        → 12/12 ✅
M6 Secure          T28–T35 ✅ (T30 → superseded by ImgBB)  → 8/8  ✅
M7 Remove Legacy   T36–T40 ✅                            → 5/5  ✅
M8 Production      T41–T52 ⬜ (⛔ ต้องถาม user ก่อน)     → 0/12
```

**รวม: 52 / 64 tasks (81%)** — เหลือ M8 deploy ล้วน ๆ (หยุดตามคำสั่ง user)

---

## Completed Tasks

### ✅ T01 — Freeze Existing Behavior
- อ่าน legacy code ครบ → `docs/legacy-behavior.md` (10 หัวข้อ, L1–L19)
- Commit: `9e8ec70`

### ✅ T02 — Migration Branch / Backup
- branch `migration/react-firebase` + tag `legacy-before-react-migration`
- Commit: `7cf0393`

### ✅ T03 — Target Folder Structure
- โครง `src/{components,pages,services,hooks,context,utils,styles}` + `docs/architecture.md`
- Commit: `a92895c`

### ✅ T04 — Vite + React (ปรับเป็น TypeScript)
- โปรเจกต์ใหม่ใน `Cosplay_plan/` — Vite + React 19 + TS + react-router v8
- routing 7 หน้า build ผ่าน, ไม่มี `window.App`/`window.UI`

### ✅ T05 — Environment Strategy
- `.env.example` + `.env` (6 Firebase keys), `.gitignore` ignore `.env`

### ✅ T06 — Firebase Project
- project `cosplay-plan` (STANDARD edition)
- Firestore database `(default)` สร้างแล้ว
- Auth (Email/Password) + Hosting เปิดใน Console แล้ว
- Web app config ครบ → `.env` มีค่าจริง 6 บรรทัด
- Hosting URL: `https://cosplay-plan.web.app`
- **Storage ยังไม่ได้เปิด** (Plan B — ต้องผูกบัตร Blaze) → **2026-09-29: ย้ายรูปไป ImgBB แล้ว** — ไม่ต้องรอ Blaze (ดูหัวข้อ "ย้ายรูปภาพไป ImgBB")

### ✅ T07 — Firebase SDK
- `firebase@12.19.0` + `src/services/firebase.ts`
- smoke test ผ่าน: `db`/`auth` initialize ไม่ throw

### ✅ T08 — Firestore Schema
- `docs/firestore-schema.md` — collection `projects`, field mapping ครบ
- ไม่มี `base64Image`, `ownerId` required, `budget` เป็น number

### ✅ T09 — Constants
- `src/utils/constants.ts` — PROJECT_STATUS, STATUS_LABELS, ITEM_CATEGORIES, VALIDATION, STORAGE_PATH

### ✅ T10 — projectService
- `src/services/projectService.ts` — CRUD ครบ (getProjects, getProjectById, createProject, updateProject, deleteProject)

### ✅ T11 — Firestore Indexes
- composite index `ownerId ASC + updatedAt DESC` deploy สำเร็จ

### ✅ T12 — storageService
- `src/services/storageService.ts` — uploadProjectImage → **ImgBB** (เขียนใหม่ 2026-09-29: คืน `Promise<string>` url · `deleteProjectImage` ถูกถอด — ไม่มี API ลบใช้ได้ + ไม่มี caller)

### ✅ T13 — Image Processing
- `src/utils/image.ts` — processImage → Blob (ไม่ใช่ base64), validateImageFile, createStorageFilename

### ✅ T14 — Enable Auth
- Email/Password เปิดใน Firebase Console แล้ว

### ✅ T15 — AuthContext
- `src/context/AuthContext.tsx` — AuthProvider + useAuth (login, register, logout)
- `src/hooks/useAuth.ts` — re-export

### ✅ T16 — Protected Routes
- `src/components/auth/ProtectedRoute.tsx` — loading/!user/user states
- ครอบ 4 routes ใน App.tsx

### ✅ T17 — Login Page
- `src/pages/Login.tsx` — form + validation + error mapping + isSubmitting

### ✅ T18 — Register Page
- `src/pages/Register.tsx` — form + validation (email/password/confirm) + error mapping

### ✅ T19–T27 — M4 Feature Parity
- `useProjects` hook (CRUD + optimistic + reset ตอน logout), Dashboard + stats + search/filter + status filter
- หน้า Create / Edit / Detail / Items — CRUD ครบ, validation ฝั่ง UI, image ≤ 5MB

### ✅ UI-01–UI-12 — M5 New UI
- Design tokens (`tokens.css` light/dark), globals/layout, Header/MobileNav/ThemeToggle, Toast, ConfirmDialog, Loading/Empty/Error
- Dashboard/Card/Form/Detail redesign + responsive/a11y pass
- (Sidebar ตอนนั้นยังขาด — gap P3 → สร้างแล้วในรอบ review-fixes)

### ✅ Code review + แผน review-fixes (2026-09-29)
- Review 2 sub-agent ขนาน → findings: **S1–S4** (security), **A1–A5** (architecture), **C1–C5** (code), **P1–P3** (process)
- แผน 13 tasks: `docs/superpowers/plans/2026-09-29-review-fixes-and-m6.md` · ledger: `.superpowers/sdd/2026-09-29-review-fixes-and-m6/progress.md`

### ✅ Tasks 1–13 — review-fixes (จบ 2026-09-29)
- **T1** legacy คืน + `NotFound.tsx` จริง (ลบ Placeholder) · **T2** semantic tokens แทน hex 16 ไฟล์ · **T3** vitest + `validation.ts` · **T4** forms ผ่าน `validateProject`/`validateItem` + `isValidUrl`
- **T5** `errors.ts`/`toUserMessage` (ข้อความไทย ไม่ leak raw) · **T6** `useProject`/`useImageUpload` + หน้า UI ไม่ผูก services ตรง (A1–A5 หมด)
- **T7** `firestore.rules` เขียน + **deploy แล้ว (user approve GATE)** + **smoke test 18/18 ผ่าน** (`scripts/rules-smoke-test.mjs`, ยิง production) · **T8** `storage.rules` เสร็จ (ไม่ deploy — ต่อมา superseded by ImgBB 2026-09-29)
- **T9** submit guard ×4 หน้า · **T10** ErrorMessage+retry · **T11** not-found 4 cases · **T12** Sidebar (P3) · **T13** quality gate + docs
- ผลข้างเคียง: lint เคยค้าง 5 errors จาก M2–M5 → แก้ครบ (แยก context เป็นไฟล์ pure ให้ fast refresh, render-phase adjustment ใน hooks ตาม `set-state-in-effect`, empty interface → type alias)
- **ทั้งหมดยังไม่ commit** (ตามคำสั่ง user)

### ✅ Final review + fixes (2026-09-29)
- Fresh-context reviewer 2 รอบ (ขอ review + verify) ตาม skill `requesting-code-review` → รอบแรกเจอ **2 Critical**: C1 `main.tsx` โหลดเทมเพลต Vite CSS แทน `styles/index.css` (design system ไม่เคยเข้า bundle!) · C2 `<form>` ซ้อน (คลิกเพิ่มของในฟอร์ม = สร้างโปรเจกต์ทิ้ง)
- แก้ครบ 2 Critical + 10 Important + minors: race guard (uidRef/idRef), ปุ่มลบบน card ลบจริง+ConfirmDialog, wire `processImage` (T13 จริง), noValidate, autoFetch option, `.gitignore` asset negation, strict mode, สี→token, AuthContext memo/Toast timeout cleanup, ลบ dead components, svg block (client+rules), index.html/README/docs sync, EditProject ส่ง imageUrl ตอนล้างรูป
- **verify รอบ 2: ✅ ทุก fix มีหลักฐาน + gate = build(strict)/lint/tests 17-17** · คงค้างตาม deferral: Storage image cleanup (รอ Blaze), integration tests hooks/pages (รอ testing-library — ต้องถาม user), firebase-tools ย้าย devDeps (user constraint), bundle >500kB (M8), manual browser smoke

### ✅ M7 — Remove Legacy (T36–T40)
- **T36** audit: 0 GAS refs / 0 `fetch` ในแอปใหม่ · **T37** audit: 0 legacy state refs, localStorage มีแค่ theme (useTheme) · **T38** audit: 0 base64 refs (Blob pipeline) + rules `hasOnly` พิสูจน์ Firestore ไม่มี field แปลก (smoke #7)
- **T39**: `gas/` ออกจากนิเวศแล้ว (หายไปก่อนหน้า) — เหลือ `docs/legacy/gas/Code.gs` เป็นเอกสารอ้างอิง, ไม่มีคำสั่ง deploy GAS ใน docs · **T40**: ลบ `src/js/*` + `src/style.css` + root `index.html` (vanilla shell) — **คืนได้จาก tag `legacy-before-react-migration`**
- gate หลังลบ: repo refs = 0 · build ✓ lint ✓ tests 17/17 ✓ · final acceptance (T44) ยังมาก่อน deploy ใน M8

### ✅ ย้ายรูปภาพ Firebase Storage → ImgBB (2026-09-29)
- **ปัญหา**: เบราว์เซอร์อัปโหลดพัง (404 bucket) → diagnose แล้วพบ **Firebase Storage เปิดไม่ได้จริง** — ตั้งแต่ ก.พ. 2026 บังคับ Blaze plan (ผูกบัตร) · user **ไม่มีบัตร** → ทางเลือกถูกคัดออกทีละอัน: Firebase Storage ❌ (บัตร) · Cloudflare R2 ❌ (บัตร + hold $5) · **user เลือก ImgBB** ✅ (ฟรี ไม่มี billing, ทดสอบ CORS จริงผ่าน)
- **แก้**: `storageService.ts` เขียนใหม่ (fetch + FormData → `api.imgbb.com/1/upload`, error mapping ไทยผ่าน `errors.ts` codes `imgbb/*`, คืน `string` url) · `useImageUpload` ตัด uid/path · `firebase.ts` ถอด `getStorage`/`storageBucket` · ลบ `STORAGE_PATH` + `deleteProjectImage` (ไม่มี API ลบใช้ได้ + ไม่มี caller) · ลบ block `storage` จาก firebase.json (M8 deploy จะไม่แตะ) · `.env` + `VITE_IMGBB_API_KEY`
- **ทดสอบ**: unit 10/10 (`storageService.test.ts`, mock fetch) · **smoke จริง 6/6** (`scripts/imgbb-smoke-test.mjs` — upload จริง → URL เปิดได้ + CORS `*` · key ผิด/ไม่มี key → deny · pdf → ImgBB ปฏิเสธเอง) · gate: build ✓ lint ✓ **tests 27/27** ✓
- **เก็บไว้**: `storage.rules` + comment หัว (กลับมาได้ถ้ามีบัตร) · docs sync: security-test §5 เขียนใหม่ตามผลจริง, architecture §5, TASKS T30 note
- ⚠️ ระหว่าง diagnose เจอ WAF ของ ImgBB (code 103) กับไฟล์ทดสอบที่ลายเซ็นผิด — ไม่ใช่ rate limit/UA (บันทึกใน security-test §5)

### ✅ UI Redesign — Ant Design แทน CSS ทั้งระบบ (2026-09-30, 13 tasks)
- **Approach 1 (user เลือก)**: antd เต็มรูปแบบ — spec 10 ไฟล์ `docs/superpowers/specs/2026-09-30-antd-redesign/` (อนุมัติแล้ว), plan `docs/superpowers/plans/2026-09-30-antd-redesign.md`, ledger `.progress.md` (deviations บันทึกครบ)
- **Stack ใหม่**: `@ant-design/icons@6.3.4` + `@fontsource-variable/inter` — provider chain: ThemeContextProvider > ConfigProvider(locale thTH, theme) > AntdApp > AuthProvider > ToastProvider > BrowserRouter (`App.tsx`) · **static methods ของ antd ห้ามใช้ — `App.useApp()` เท่านั้น**
- **Design**: primary `#ff6b00`, bg `#fff8d7`, fg `#1d1836`, dark kit.dark `#0f1115/#171a21/#f8fafc/#a7adba/#2a2f3a`, Inter, radius 10/16/20, fontSize 15, container 1280 — antd theme ใน `src/theme/antdTheme.ts`, tokens ชุดเดียวใน `src/styles/tokens.css`
- **จบครบ 13 tasks**: T1 theme/Context · T2 tokens ใหม่ · T3 ConfirmDialog/Loading/ErrorMessage → Modal/Spin/Result · T4 Toast → notification (ตัด `toast-context` เหลือ `{addToast}` + `TOAST_DISMISS_MS`) · T5 Layout/Header/Sidebar/MobileNav → Layout+Menu · T6 Dashboard (Card/Statistic/Input+prefix/Select/Image/Tag/Empty) · T7 ฟอร์มโปรเจกต์ (Form+onFinish+setFields โยน validateProject, Upload.Dragger, ItemForm/ItemList) · T8 Create/Edit (Result 404/error) · T9 Detail (Space+Button/List/Card/Tag, security guard คง) · T10 Auth (Form rules เรียก validator เดิม) · T11 NotFound → Result 404 (**test ผ่าน unmodified**) · T12 CSS finalization (ลบ `components.css` + block token teal, rename `--font-size-*→--text-*` `--transition-*→--motion-*` `--line-height-*→--leading-*` `--radius-full→--radius-pill` `--color-*→` ชุดใหม่, `var()` ทุกตัว verify resolve) · T13 final gates + บันทึกนี้
- **Gates ตอนจบ**: build ✓ lint ✓ **tests 32/32** (เดิม 31+shopLinkRender 4/4 + NotFound 1/1 **ไม่ถูกแก้เลย**) · rules-smoke **18/18** · imgbb-smoke **6/6** · bundle raw **1,635,411 B** (baseline 857,855 → antd เพิ่ม ~778KB, gzip 502KB — budget ตรวจที่ M8/T51)
- **Contract ห้ามพลาดต่อไป**: UI ห้ามผูก Firestore ตรง ๆ · `image.ts`(≤5MB)/`validation.ts`/`errors.ts`/`services/*`/rules ไม่แตะ · security assertions ใน `shopLinkRender.test.tsx`/`NotFound.test.tsx` ห้ามแก้ · antd static ห้าม · สอง-block token เลิกแล้ว (block เดียว)
- **Deviations (ดู ledger ฉบับเต็ม)**: antd v6 ไม่มี `borderRadiusXL` → radius 20 อยู่ที่ `--radius-lg` · SearchBar ใช้ `Input+prefix` แทน `Input.Search` (กันไอคอนซ้ำ) · ImageUploader: Dragger `openFileDialogOnClick={false}` กัน double dialog, drop ไม่ handleFile ซ้ำตอนมี Dragger, `--z-sticky` เป็น extension

### ✅ โครงสร้างเว็บ + โครงสร้างโค้ด — เฟส 1 (2026-09-30)
- **ปัญหาที่ผู้ใช้เจอเอง (9 จุด)**: login/register อยู่ใต้ Layout (เห็นเมนูก่อน login) · 4 วิธีกำหนดความกว้างหน้า · `ProtectedRoute` ครอบซ้ำ 4 จุด · โค้ดซ้ำ ~70 บรรทัด (state block + submit logic) · `ItemList` ซ้ำกับ `ProjectItems` · สี hex ซ้ำ 2 แหล่ง · เมนูประกอบซ้ำ 2 ที่ · ไม่มี ErrorBoundary · `ImageUploader` 260 บรรทัด
- **วิธี**: spec `docs/superpowers/specs/2026-09-30-structure-overhaul-design.md` + plan + ledger `.progress.md` · แนวทาง B (แก้เจาะจุด ไม่ย้ายโฟลเดอร์) · แบ่ง 2 เฟส (ผู้ใช้เลือก) · login = แถบบางโลโก้+สลับธีม (ผู้ใช้เลือก)
- **เฟส 1 เสร็จ 8/8 task (รอผู้ใช้ตรวจเบราว์เซอร์)**:
  - `src/config/nav.tsx` = `NAV_ITEMS` จุดเดียว (Sidebar+MobileNav อ่านจากนี้)
  - `PageContainer` (`default|form|bare` อ้าง token) · `PageState` (`loading|error|notFound|404|empty` ไม่พึ่ง router) · `AuthLayout` (แถบบาง) · `ErrorBoundary` (+`ErrorFallback` แยกให้ทดสอบ)
  - `App.tsx` = layout route (`AuthLayout` | `ProtectedRoute`+`AppLayout` | `*`) · `ProtectedRoute` เป็น `<Outlet/>` · `Layout`→`AppLayout`
  - ทุกหน้าใช้ PageContainer · Detail ปุ่มกลับ = `href="/"` (เลิก `navigate(-1)` ที่พึ่ง history) · ลบ `common/Loading.tsx`+`ErrorMessage.tsx`+`.container-narrow/.container-wide`
  - token ใหม่ `--container-form: 720px`, `--container-auth: 420px`; `.container` (header) = `--container-max` + padding ตรง `.page-container`
- **Gates:** build ✓ lint ✓ **tests 49/49** (13 ไฟล์ = 32 เดิม + 17 ใหม่) · rules-smoke **18/18** · `shopLinkRender`/`NotFound` tests ผ่านโดยไม่ถูกแก้
- **เฟส 2 (รอผู้ใช้สั่งต่อ)**: `useProjectSubmit` · รวม `ItemList`/`ProjectItems` · แยก `useImageSelection` · sync-guard test สี JS↔CSS
- **ข้อควรรู้**: `NavItem` ต้องเป็น **type alias** ไม่ใช่ interface (antd `MenuItemType` มี index signature จาก `DataAttributes` — TS ให้ implicit index เฉพาะ type alias)

### ✅ COSPLAN Product Redesign — V1–V3 (2026-09-30, แผน 7 task)
- **สเปค:** `docs/superpowers/specs/2026-09-30-cosplan-product-redesign-design.md` · **แผน:** `.../plans/2026-09-30-cosplan-product-redesign.md` · **ledger:** `.progress.md` (มี Ruling ทั้งหมด)
- **ตัดสินใจร่วมกับผู้ใช้ 10 ข้อ (D1–D10):** แตะ services/rules ได้ · ม่วง `#7C3AED` + ชื่อ **COSPLAN** · **dark เป็นธีมหลัก (default มืด) + light เลือกได้** · progress/spent คำนวณจากรายการ (`item.done`) · Share = คัดลอกลิงก์ · ลำดับแบบ vertical slice · ปุ่มไปร้านใน Detail · Hero เป็น mockup UI · Showcase = ตัวอย่าง 3 ใบ · **ไม่ทำ Settings/Profile**
- **เสร็จ 7/7 task (V1–V3):**
  - T1 brand tokens (ม่วง/นิวทรัล light+dark, type 13–48px, radius 8/12/16/24, `--elev-card`) + `ThemeContext` default มืด + `antdTheme` ตรง tokens + **ชื่อ COSPLAN** (Header/AuthLayout/index.html)
  - T2 `utils/projectProgress.ts` (`progressOf`/`spentOf`/`isOverBudget`) + `ProjectItem.done?` — **ไม่ต้องแก้ firestore.rules** (rules ตรวจแค่ `items is list`)
  - T3 `context/authActions.ts` (`registerWithDisplayName` → `updateProfile`) + field "ชื่อ" ใน Register + Header แสดง `displayName ?? email` — **firestore.rules ไม่ถูกแก้เลย**
  - T4 Dashboard = workspace (greeting/quick action/6 ล่าสุด/กิจกรรมล่าสุด) + หน้าใหม่ `/projects` (ค้นหา+กรอง+เรียง) + `NAV_ITEMS` 3 รายการ + `DashboardHeader`→`common/PageHeader`
  - T5 ProjectCard: Progress + `spent/budget` + ป้ายเกินงบ + เมนู `⋮` (แก้ไข/ลบ) + hover `--elev-card`
  - T6 Detail = showcase: progress/งบ + รายการติ๊ก "ซื้อแล้ว" (เขียน Firestore ผ่าน `updateProject` เดิม) + **ปุ่ม "ไปที่ร้านค้า"** (rel=noopener noreferrer + aria-label) + ปุ่มคัดลอกลิงก์ + `utils/clipboard.ts` + checkbox ในฟอร์ม
  - T7 ปิดงาน: gates + grep + memory + ส่งผู้ใช้ตรวจเบราว์เซอร์
- **Gates ตอนจบ V1–V3:** build ✓ · lint ✓ · **tests 96/96 (22 ไฟล์)** · rules-smoke **18/18** · imgbb-smoke **6/6** · bundle raw 1,637,036 B · `shopLinkRender`/`NotFound` tests ผ่านโดยไม่ถูกแก้
- **⚠️ กับพลัง: ห้ามแก้ไฟล์เดียวกันสองครั้งในรอบเดียว** — เกิด 2 ครั้งแล้ว (Vite เสิร์ฟโมดูล transform ค้าง → `progress is not defined` / `Checkbox is not defined` ในหน้า Detail + CreateProject; โค้ดบนดิสก์ถูกเสมอ) · **วิธีตรวจ**: `curl -s http://localhost:5173/<ไฟล์> | grep -c "<ตัวแปรที่เพิ่งเพิ่ม>"` ถ้า 0 = cache เก่า · **วิธีแก้**: kill dev server + `rm -rf node_modules/.vite` + restart · ErrorBoundary กันหน้าเพี้ยนไว้แล้วแต่ผู้ใช้เห็น error ต้องรีเฟรชเอง (มันไม่ recover อัตโนมัติ)
- **เหลือทำต่อ (แผนแยก):** V4 Landing/PublicLayout + ย้าย route `/`→`/dashboard` · V5 ฟอร์ม 5 ขั้น · V6 Skeleton · V7 polish/a11y/QA
- **แก้ตามรีเฟรชผู้ใช้ (ยังไม่ commit):** แถบบน 64px→56px + `lineHeight: normal` (antd default ทำให้บรรทัดลอย) · ปุ่มสลับธีม 44px→วงกลม 32px · ลบ `className="container"` ที่ไม่มี CSS จริง

### ✅ หน้า Settings (บัญชี) — 2026-09-30 (bounded · ledger `plans/2026-09-30-settings.progress.md`)
- **สิ่งที่ทำ:** หน้า `/settings` = ชื่อที่แสดง + เปลี่ยนอีเมล + เปลี่ยนรหัสผ่าน (Firebase Auth ล้วน) · ปุ่ม ⚙️ ในแถบบน (ไม่เพิ่มในเมนู เพราะแถบล่างมือถือแน่นเกิน) · **ไม่มีระบบลบบัญชี · ไม่มี profile doc → `firestore.rules` ไม่ถูกแก้**
- **โครง:** `context/authActions.ts` เก็บ logic ทั้งหมด (`updateDisplayName`/`changeEmail`/`changePassword` + `requireUser()` + `reauthenticate()`) · `components/settings/{DisplayNameForm,EmailForm,PasswordForm}.tsx` รับ `onSubmit` ที่**คืนข้อความ error ไทย** (หรือ `null` = สำเร็จ) → ฟอร์มแสดง Alert เอง ไม่ต้อง try/catch ซ้ำในหน้า
- **กติกาความปลอดภัยที่ยึด:** re-auth (`reauthenticateWithCredential`) ก่อนเปลี่ยนอีเมล/รหัสผ่าน**เสมอ** — มีเทสต์ยืนยันลำดับการเรียก (`['reauth','updateEmail']`) · เปลี่ยนรหัสผ่านสำเร็จแล้ว **ออกจากระบบ + กลับ `/login`** บังคับเข้าสู่ระบบใหม่
- **🐛 บั๊กที่เจอระหว่างทำ + แก้ไปแล้ว:** `Login.tsx`/`Register.tsx` ทำ map error key เป็น `wrong-password` (ไม่มี prefix) แต่ `FirebaseError.code` ของ Auth มี `auth/` เสมอ → **ไม่มีวัน match ผู้ใช้เห็นแต่ข้อความ generic ทุกครั้ง** (เช่น อีเมลซ้ำ, รหัสผ่านผิด) · ย้ายไป `utils/authErrors.ts` ด้วย key เต็ม ใช้ร่วม 3 หน้า · **Firestore/ImgBB error ไม่มี prefix** (ใน `utils/errors.ts`) — อย่าเอามาปน
- **Gates:** build ✓ · lint ✓ · **tests 131/131 (25 ไฟล์)** · rules-smoke 18/18 · ยังไม่ commit
- **ข้อควรรู้ 2 ข้อ:** (1) เทสต์แบบ SSR ทำได้แค่ "assert markup" เทสต์พฤติกรรมฟอร์ม (กดบันทึกแล้วเกิดอะไร) ต้องลองด้วยมือ — repo ไม่มี jsdom (2) **`edit` ไฟล์ที่มีข้อความไทยมัก fail** เพราะ Unicode normalization ไม่ตรงกับที่พิมพ์ → ใช้ `python3` + regex แก้แทน
- **ข้อควรรู้เพิ่ม:** เทสต์ที่ต้อง stub `window` ด้วย (SSR ข้าม localStorage) · logic ที่ต้องเทสต์ผ่าน React ควรแยกเป็นโมดูลเพื่อเลี่ยง eslint `react-hooks/globals` · `DisplayName → email` fallback ยังไม่มีเทสต์ (ต้อง DOM) → ตรวจด้วยตา

---

## 🔍 Key Findings จาก legacy

### ข้อเท็จจริงที่ต่างจากแผน

| # | เรื่อง | แผนคิดว่า | ของจริง |
|---|---|---|---|
| F1 | `category` | `"wig"` (อังกฤษ) | **`วิก`/`ชุด`/`พร็อพ`/`รองเท้า`** (ไทย) |
| F2 | Status label | ไม่มี emoji | มี emoji, `completed` = "คอสเสร็จแล้ว" |
| F3 | ขนาดรูป | 20MB | **10MB** (app.js) / ข้อความ 5MB → ไม่ตรงกัน |
| F4 | `src/js/image.js` | เป็น pipeline | **dead code** — ไม่เคยถูกเรียก |
| F5 | Image pipeline | อยู่ใน `image.js` | inline ใน `app.js` (1200px, JPEG 0.7) |

### จุดอ่อนของระบบเดิม (L1–L19)

```text
L1 ไม่มี auth — GAS deploy เป็น "Anyone"
L2 Base64 ใน database
L3 localStorage เป็นแหล่งข้อมูลหลัก
L4 getProjects() ถูกเรียกทุก keystroke
L5 search ยิง 2 ครั้ง/keystroke
L6 validation แค่ charName
L7 XSS — innerHTML ไม่ escape
L8 shopLink ไม่ validate
L9 ปุ่มบน card opacity:0 → มือถือแตะไม่ได้
L10 ไม่มี routing
L11 GAS timeout/quota
L12 GAS update ลบรูปไม่ได้
L13 hasImage ไม่สม่ำเสมอ
L14 detail ใช้ currentEditId ผูกกัน
L15 ไม่มี sort/filter เพิ่ม
L16 ไม่มี a11y
L17 ไม่มี optimistic UI/retry
L18 drop zone ไม่มี handler
L19 input ลิงก์รูปอยู่ใน display:none
```

---

## Key Decisions / Context

- **Legacy stack:** Vanilla HTML/JS + Google Apps Script + Google Sheets
- **Target stack:** Vite + React 19 + TypeScript + Firebase (Firestore, Auth, Hosting)
- **โปรเจกต์ใหม่อยู่ใน `Cosplay_plan/`** — TypeScript (.tsx) + react-router v8 + pnpm
- **Plan B → แก้แล้ว (2026-09-29):** Storage เปิดไม่ได้ไม่มีบัตร ( Blaze บังคับ ก.พ. 2026) → **รูปภาพย้ายไป ImgBB** (ฟรี, user เลือกเอง) — ไม่ต้องรอ Blaze อีกต่อไป
- **ห้าม:** UI component ผูก Firestore ตรง, Base64 ใน DB, ลบ legacy ก่อนผ่าน acceptance test
- **pnpm global bin PATH** แก้แล้ว — เพิ่ม `/home/teerametr/.local/share/pnpm/bin` ใน `~/.bashrc`
- **firebase-tools** ถอดออกแล้ว (ผู้ใช้ติดตั้งเอง) — ใช้ตอน deploy เท่านั้น

### ตัดสินใจแล้ว

```text
?1  category → คงภาษาไทย (วิก/ชุด/พร็อพ/รองเท้า) ✅
?2  emoji → เก็บใน constants (UI layer) ✅
?3  local-first → Firestore เป็นหัวหน้า ✅
?4  validation → บังคับ charName + email/password ✅
?5  image limit → 5MB (ตามแผน) ✅
?6  max dimension → 1200px ✅
?7  budget → ยังไม่ตัดสิน
?8  empty state → ยังไม่ตัดสิน
```

---

## Firebase Project

| | |
|---|---|
| **Project ID** | `cosplay-plan` |
| **Hosting URL** | `https://cosplay-plan.web.app` |
| **Firestore** | `(default)` database, STANDARD edition |
| **Auth** | Email/Password เปิดแล้ว |
| **Storage** | ❌ ไม่เปิด/ไม่ใช้แล้ว (บังคับ Blaze — รูปย้ายไป ImgBB 2026-09-29) |
| **Web App ID** | `1:1094614174338:web:18adcb394b410419dd829b` |

---

## Environment Variables

`.env` มีค่าจริงแล้ว (project `cosplay-plan`) — ถูก ignore โดย `.gitignore` แล้ว

```env
VITE_FIREBASE_API_KEY=<ค่าจริงอยู่ใน .env เท่านั้น — ห้าม paste ลง doc>
VITE_FIREBASE_AUTH_DOMAIN=cosplay-plan.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cosplay-plan
VITE_FIREBASE_STORAGE_BUCKET=cosplay-plan.firebasestorage.app   # แอปไม่ใช้แล้ว (เหลือให้ scripts)
VITE_FIREBASE_MESSAGING_SENDER_ID=1094614174338
VITE_FIREBASE_APP_ID=1:1094614174338:web:18adcb394b410419dd829b
VITE_IMGBB_API_KEY=<ค่าจริงอยู่ใน .env เท่านั้น — ห้าม paste ลง doc>
```

---

## File Inventory (New Project)

```text
Cosplay_plan/
├── docs/
│   ├── TASKS.md              checklist 64 tasks
│   ├── legacy-behavior.md    baseline พฤติกรรมเดิม
│   ├── architecture.md       layer rules + data flow
│   ├── firestore-schema.md   schema + field mapping
│   ├── memory.md             ไฟล์นี้
│   └── legacy/gas/Code.gs    อ้างอิง legacy
├── src/
│   ├── components/
│   │   ├── auth/       ProtectedRoute
│   │   ├── common/       ConfirmDialog, ErrorMessage, Loading, Modal, Toast
│   │   ├── dashboard/  ProjectCard, ProjectGrid, StatsCards, SearchBar, StatusFilter, DashboardHeader
│   │   ├── layout/     Layout, Header, Sidebar, MobileNav, ThemeToggle
│   │   └── project/    ProjectForm, ItemForm, ProjectItems, ItemList, ImageUploader,
│   │                   ProjectHero, ProjectStatus, StatusSelect, ProjectNote (+ tests)
│   ├── context/        AuthContext(+auth-context), ToastContext(+toast-context)
│   ├── hooks/          useAuth, useToast, useProjects, useProject, useTheme, useImageUpload
│   ├── pages/          Dashboard, CreateProject, ProjectDetail, EditProject, Login, Register, NotFound (+ tests)
│   ├── services/       firebase (Firestore/Auth), projectService, storageService (ImgBB)
│   ├── styles/         tokens, globals, layout, components, index.css
│   ├── utils/          constants, validation(+tests), errors(+tests), image,
│   │                   formatters, projectStats, projectFilters
│   ├── App.tsx, main.tsx
│   └── assets/
├── scripts/            rules-smoke-test.mjs (ยิง production rules จริง 18/18),
│                       imgbb-smoke-test.mjs (upload จริง 6/6), smoke-firebase.mjs
├── docs/security-test.md   matrix Firestore rules (18/18) + ImgBB (6/6)
├── index.html, README.md
├── public/ (favicon.svg, icons.svg)
├── firebase.json, .firebaserc, firestore.rules, firestore.indexes.json, storage.rules
├── .env, .env.example, .gitignore
├── package.json, vite.config.ts, tsconfig*.json, eslint.config.js
└── pnpm-lock.yaml, pnpm-workspace.yaml
```

---

## Next Actions

1. ⛔ **หยุดก่อน M8 / T41–T52** — deploy ทุกกรณีต้องถาม user ก่อน (ยังไม่ commit ด้วย)
2. **user ตรวจ antd UI ในเบราว์เซอร์** (dev server รันอยู่ `localhost:5173`) — checklist 9 ข้อที่ส่งให้ + **ทดสอบ upload รูป (ImgBB)** ที่เคยพัง
3. **code review** งาน redesign (fresh context) แล้วค่อยว่ากันต่อ (M8 ต้องถามก่อน)
4. (ถ้า user อนุมัติ) เพิ่ม testing-library → เขียน integration tests ของ hooks/pages
5. (ถ้า user อนุมัติ) ย้าย `firebase-tools` ไป devDependencies

---

## Known Issues / Blockers

- ⏸️ **ยังไม่ได้ commit** — ทุกอย่างอยู่ใน working tree (branch `migration/react-firebase` ล่าสุด `a92895c`)
- ✅ **Storage/บัตร — แก้แล้ว 2026-09-29** — เปิดไม่ได้ไม่มีบัตร (บังคับ Blaze) → ย้ายรูปไป **ImgBB** แล้ว · ข้อจำกัดที่ยอมรับ: (1) `VITE_IMGBB_API_KEY` อยู่ใน client bundle (คนเห็นได้ — regenerate ได้ที่ api.imgbb.com), (2) รูปสาธารณะถ้ามี URL, (3) **รูปค้างบน ImgBB เมื่อ replace/remove/ลบโปรเจกต์** (ไม่มี API ลบจาก client — deferral "Storage image cleanup" เปลี่ยนเป็น won't-do), (4) ผูกกับ ImgBB เป็น third party — ถ้าเขาลบบัญชี/ปิดบริการ รูปเก่าตาย (URL ใน Firestore จะตายตาม)
- ⏸️ **ยังไม่ได้ push ขึ้น remote**
- ⏸️ **ส่วนที่ต้องยืนยันด้วยการรันเว็บจริง ยังค้าง** — desktop browser ไม่ได้เชื่อมต่อ session (แทนด้วย automated tests + grep checks)
- ⏸️ **Anonymous auth ยังปิด** (แอปไม่ได้ใช้ — ใช้ email/password) · Email/Password **เปิดแล้ว** 2026-09-29 (ยืนยันด้วย smoke test)
- ⏸️ **account ทดสอบค้าง ~5 คู่** `rules-smoke-*@example.com` จากก่อนมี cleanup — ลบได้ใน Firebase Console → Authentication → Users (รันใหม่จะลบตัวเองแล้ว)
- ⏸️ **final acceptance (T44) ยังไม่ได้ทำ** — legacy ถูกลบตาม M7 แล้ว (กู้คืนได้จาก tag `legacy-before-react-migration`) · ต้อง verify หน้าเว็บจริงก่อนถึง deploy

---

*Last updated: 2026-09-30 — จบ Ant Design redesign 13/13 tasks (gates: build/lint ✓, tests 32/32, rules 18/18, imgbb 6/6) — ⛔ หยุดก่อน M8 deploy (ต้องถาม user) · ค้าง: browser checklist 9 ข้อ + code review + final acceptance (T44)*

> ⚠️ **ห้ามใส่ค่า key จริงในไฟล์เอกสาร** (Firebase / ImgBB) — ไฟล์นี้ถูก commit ขึ้น GitHub
> ค่าจริงอยู่ใน `.env` ซึ่งถูก `.gitignore` กันอยู่แล้ว · ดูค่าได้จาก
> Firebase Console → Project settings → General → Your apps → SDK setup and configuration
