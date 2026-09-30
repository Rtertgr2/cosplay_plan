# Cosplay Planner 🎭

แอปวางแผนคอสเพลย์ — จัดการโปรเจกต์, รายการของ (วิก/ชุด/พร็อพ/รองเท้า), งบประมาณ และสถานะ

**Stack:** Vite + React 19 + TypeScript + react-router v8 · Firebase (Auth + Firestore) · pnpm

> ย้ายจาก legacy Vanilla HTML/JS + Google Apps Script + Google Sheets → ดูแผนงานใน `docs/TASKS.md`

## เริ่มต้น

```bash
pnpm install
cp .env.example .env        # เติมค่า Firebase (ดู `docs/memory.md` §Firebase Project)
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

## Architecture

```
หน้า UI (pages/components) → hooks → services → Firebase
```

- **หน้า UI ห้าม import service/Firestore ตรง** — ผ่าน hook เท่านั้น (`docs/architecture.md`)
- **ห้าม base64 ใน DB** — รูปเป็น Blob → upload ขึ้น **ImgBB** → เก็บ URL ใน Firestore (Firebase Storage ใช้ไม่ได้ไม่มีบัตร — ดู `docs/security-test.md` §5)
- **rules จริง** — `firestore.rules` (deploy แล้ว, ผลทดสอบ 18/18 ใน `docs/security-test.md`)

## สถานะ

- ✅ M1–M7 เสร็จ (React boots, CRUD, Auth, feature parity, UI ใหม่, security, remove legacy)
- ⛔ M8 Deploy (ต้องอนุมัติก่อน)
- ✅ รูปภาพ: ImgBB (ฟรี ไม่ต้องใช้บัตร) — smoke 6/6 · เก่า: Storage รอ Blaze → เลิกใช้ (`storage.rules` เก็บไว้เผื่อกลับมา)

## โครงสร้าง

```
src/
├── pages/        Dashboard, CreateProject, ProjectDetail, EditProject, Login, Register, NotFound
├── components/   auth/ common/ dashboard/ layout/ project/
├── hooks/        useAuth, useToast, useProjects, useProject, useImageUpload
├── context/      AuthContext, ToastContext
├── services/     firebase, projectService, storageService (ImgBB)
├── styles/       tokens.css (design tokens), globals, layout, components
└── utils/        validation, errors, image, formatters, projectStats, projectFilters
```

เอกสารเพิ่มเติม: `docs/memory.md` (ความคืบหน้า) · `docs/TASKS.md` (checklist) · `docs/architecture.md` (กฎชั้นระบบ)
