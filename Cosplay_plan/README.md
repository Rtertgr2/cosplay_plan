# Cosplay Planner 🎭

แอปวางแผนคอสเพลย์ — จัดการโปรเจกต์, รายการของ (วิก/ชุด/พร็อพ/รองเท้า), งบประมาณ และสถานะ

**Stack:** Vite + React 19 + TypeScript + react-router v8 · Firebase (Auth + Firestore) · antd v6 · ImgBB · pnpm

> ย้ายจาก legacy Vanilla HTML/JS + Google Apps Script + Google Sheets → ดูแผนงานใน `docs/TASKS.md`

## เริ่มต้น

```bash
pnpm install
cp .env.example .env        # เติมค่า Firebase + ImgBB (ดู `docs/firebase-setup.md`)
pnpm dev                    # http://localhost:5173
```

## Commands

| Command | ทำอะไร |
|---|---|
| `pnpm dev` | dev server + HMR |
| `pnpm build` | `tsc -b` (strict) + `vite build` |
| `pnpm lint` | eslint ทั้งโปรเจกต์ |
| `pnpm test` | vitest (unit tests) |
| `node scripts/rules-smoke-test.mjs` | ยิง Firestore rules จริงบน production (สร้าง-ลบ account ทดสอบเอง) |
| `node scripts/imgbb-smoke-test.mjs` | ทดสอบอัปโหลดรูปขึ้น ImgBB จริง (6/6) |
| `pnpm exec firebase deploy --only firestore:rules,storage,hosting` | deploy (ดู `docs/firebase-setup.md`) |

## Architecture

```
หน้า UI (pages/components) → hooks → services → Firebase
```

- **หน้า UI ห้าม import service/Firestore ตรง** — ผ่าน hook เท่านั้น (`docs/architecture.md`)
- **ห้าม base64 ใน DB** — รูปเป็น Blob → upload ขึ้น **ImgBB** → เก็บ URL ใน Firestore (Firebase Storage ใช้ไม่ได้ไม่มีบัตร — ดู `docs/security-test.md` §5)
- **rules จริง** — `firestore.rules` (deploy แล้ว, ผลทดสอบ 18/18 ใน `docs/security-test.md`)

## สถานะ

- ✅ M1–M7 เสร็จ (React boots, CRUD, Auth, feature parity, UI ใหม่, security, remove legacy)
- ✅ COSPLAN redesign: brand ม่วง/dark · Landing + `/dashboard` · progress/spent · Settings (ชื่อ/อีเมล/รหัสผ่าน) · skeleton
- ⛔ M8 Deploy (ต้องอนุมัติก่อน — `docs/firebase-setup.md` §5)
- ✅ รูปภาพ: ImgBB (ฟรี ไม่ต้องใช้บัตร) — smoke 6/6 · เก่า: Storage รอ Blaze → เลิกใช้ (`storage.rules` เก็บไว้เผื่อกลับมา)

## โครงสร้าง

```
src/
├── pages/        Landing, Dashboard, Projects, CreateProject, ProjectDetail, EditProject, Settings, Login, Register, NotFound
├── components/   auth/ common/ dashboard/ layout/ project/ settings/
├── hooks/        useAuth, useToast, useProjects, useProject, useImageUpload
├── context/      AuthContext, ToastContext
├── services/     firebase, projectService, storageService (ImgBB)
├── utils/        projectProgress, projectItems, clipboard, authErrors
├── styles/       tokens.css (design tokens), globals, layout, components
└── utils/        validation, errors, image, formatters, projectStats, projectFilters
```

เอกสารเพิ่มเติม: `docs/firebase-setup.md` (ตั้งค่า/deploy) · `docs/memory.md` (ความคืบหน้า) · `docs/TASKS.md` (checklist) · `docs/architecture.md` (กฎชั้นระบบ) · `docs/security-test.md` (ผลทดสอบ 18/18)
