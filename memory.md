# Memory — Cosplay Planner Migration

> บันทึกความคืบหน้า งานที่เสร็จแล้ว และบริบทสำคัญ
> อัปเดตทุกครั้งที่จบ task / milestone

---

## Project Status

| | |
|---|---|
| **Current Phase** | Phase 1 — Baseline / Foundation |
| **Current Task** | T03 — Define Target Folder Structure (ถัดไป) |
| **Branch** | `migration/react-firebase` |
| **Tag** | `legacy-before-react-migration` → `bfec9e0` (จุดสุดท้ายก่อนเริ่ม React) |
| **Last Commit** | `7cf0393 chore: prepare migration branch` |
| **Remote** | มี origin (GitHub) แต่ยังไม่ push |

### Milestone Progress

```text
M1 React Boots     T01 ✅  T02 ✅  T03 ⏳  T04 ⬜  T05 ⬜   → 2/5
M2 Firebase CRUD   T06–T13 ⬜                                    → 0/8
M3 Auth            T14–T18 ⬜                                   → 0/5
M4 Feature Parity  T19–T27 ⬜                                   → 0/9
M5 New UI          UI-01–UI-12 ⬜                               → 0/12
M6 Secure          T28–T35 ⬜                                   → 0/8
M7 Remove Legacy   T36–T40 ⬜                                   → 0/5
M8 Production      T41–T52 ⬜                                   → 0/12
```

**รวม: 2 / 64 tasks (3%)**

---

## Completed Tasks

### ✅ T01 — Freeze Existing Behavior
- [x] อ่าน legacy code ครบทุกไฟล์ (`index.html`, `src/js/*`, `gas/Code.gs`, `src/style.css`)
- [x] เขียน `docs/legacy-behavior.md` (10 หัวข้อ)
  - System Overview / Data Model (จริง) / Status & Labels
  - Behavior ที่ต้อง preserve (Dashboard, Form, Items, Image, Detail, Theme, Loading/Toast, Offline-Sync)
  - Known Limitations **L1–L19**
  - สิ่งที่ต้องตัดสินใจตอน migrate
  - GAS API contract + Files to archive
  - Design tokens เดิม (อ้างอิง UI-01)
  - Acceptance criteria for migration
- [x] **ไม่แก้ code เดิมเลยแม้แต่บรรทัดเดียว**
- Commit: `9e8ec70 docs: document legacy behavior before migration`

### ✅ T02 — Migration Branch / Backup
- [x] `git checkout -b migration/react-firebase`
- [x] `git tag legacy-before-react-migration`
- [x] push → *skipped (ยังไม่ push)*
- [x] ยืนยันด้วย `git branch -a` + `git tag`
- Commit: `7cf0393 chore: prepare migration branch`

---

## In Progress

*ไม่มี*

---

## 🔍 Key Findings จาก legacy (สำคัญมาก)

### ข้อเท็จจริงที่ **ต่างจากแผน**

| # | เรื่อง | แผนคิดว่า | ของจริง |
|---|---|---|---|
| F1 | `category` ของ item | `"wig"` (อังกฤษ) | **`วิก` / `ชุด` / `พร็อพ` / `รองเท้า`** (ไทย) |
| F2 | Status label | ไม่มี emoji | มี emoji นำหน้า, `completed` = "คอสเสร็จแล้ว" |
| F3 | ขนาดไฟล์รูป | 20MB | **10MB** (ใน `app.js`) / ข้อความบน UI เขียน 5MB → 3 อย่างไม่ตรงกัน |
| F4 | `src/js/image.js` | เป็น image pipeline | **dead code** — ไม่เคยถูกเรียก |
| F5 | Image pipeline จริง | อยู่ใน `image.js` | inline อยู่ใน `app.js:handleImageFile()` (1200px, JPEG 0.7) |
| F6 | ตัวเลือก status | 5 ค่า | 5 ค่าตรงตามแผน ✅ (ค่าเดียวที่ตรง) |

### จุดอ่อนของระบบเดิม (L1–L19)

```text
L1  ไม่มี auth — GAS deploy เป็น "Anyone"
L2  Base64 ใน database (ช้าลงเรื่อย ๆ, quota เต็ม)
L3  localStorage เป็นแหล่งข้อมูลหลัก (5MB เต็มง่าย)
L4  getProjects() ถูกเรียกทุก keystroke → fetch GAS ซ้ำ
L5  search ยิง 2 ครั้ง/keystroke (inline oninput + addEventListener)
L6  validation แค่ charName; required ใน HTML ใช้ไม่ได้ (onsubmit="return false")
L7  XSS — innerHTML interpolate ค่าผู้ใช้โดยไม่ escape
L8  shopLink ใส่ javascript: ได้ ไม่มี validate
L9  ปุ่มบน card opacity:0 → มือถือแตะไม่ได้
L10 ไม่มี routing — refresh แล้ว deep link ไม่ได้
L11 GAS timeout / quota limit
L12 GAS update ลบรูปไม่ได้ (if (data.base64Image) ...)
L13 hasImage คืนใน list แต่ไม่คืนใน get
L14 detail ใช้ State.currentEditId ผูกกัน → เสี่ยงผิดโปรเจกต์
L15 ไม่มี sort/filter เพิ่ม
L16 ไม่มี a11y (div onclick, ไม่มี alt, ไม่มี focus)
L17 ไม่มี optimistic UI / retry
L18 drop zone บอกว่าลากได้แต่ไม่มี handler
L19 input ลิงก์รูปอยู่ใน display:none (feature ค้าง)
```

### ต้องตัดสินใจ (ยังไม่ตัดสิน)

```text
?1  category  → คงภาษาไทย หรือเปลี่ยนเป็น slug อังกฤษ?
?2  emoji ใน status label → เก็บใน constants หรือแยกไป UI layer?
?3  local-first → Firestore เป็นหัวหน้า (SDK จัดการ offline cache เอง)
?4  validation → บังคับเท่าของเดิม (charName) หรือเข้มขึ้น (เพิ่ม seriesName)?
?5  image limit → ยึด 5MB ตามแผน (ทิ้ง 10MB ของเดิม)
?6  max dimension → ยึด 1200px ของเดิม
?7  budget → แสดง "รวมราคาสินค้า" เพิ่มไหม?
?8  empty state → แยก "ไม่มีข้อมูล" กับ "ค้นไม่เจอ"?
```

### ต้องยืนยันโดยรันเว็บจริง (ยังไม่ได้ทำ)

```text
- ลากไฟล์รูปมาวาง drop zone ใช้ได้ไหม
- ไฟล์ 6–10MB ผ่านไหม (ขัดกับข้อความ 5MB)
- GIF → canvas เหลือเฟรมแรก?
- PNG พื้นใส → พื้นขาว/ดำ?
- GAS URL hard-code ใน api.js ยังใช้ได้ไหม
```

---

## Key Decisions / Context

- **Legacy stack:** Vanilla HTML/JS + Google Apps Script + Google Sheets
- **Target stack:** React + Vite + Firebase (Firestore, Storage, Auth, Hosting)
- **หลักการ:** สร้าง layer ใหม่ขนาน → ย้าย data ก่อน UI → ลบ legacy ทีหลัง
- **ห้าม:** UI component ผูก Firestore ตรง, Base64 ใน DB, ลบ legacy ก่อนผ่าน acceptance test
- **Docs จัดเก็บใน `docs/`** (ไม่ใช่ root) — `TASKS.md`, `legacy-behavior.md`, แผนต้นฉบับ
- **`memory.md` อยู่ที่ root** (ตามที่ผู้ใช้ต้องการ)

### ไฟล์เอกสาร

| ไฟล์ | บทบาท |
|---|---|
| `docs/Cosplay_Planner_Detailed_Tasks.md` | แผนต้นฉบับ (3,362 บรรทัด) — Goal/Acceptance เต็ม |
| `docs/TASKS.md` | checklist แตก subtask (2,004 บรรทัด) — ใช้ติ๊กงาน |
| `docs/legacy-behavior.md` | baseline พฤติกรรมเดิม + L1–L19 |
| `memory.md` | ไฟล์นี้ — ความคืบหน้า + findings |

---

## File Inventory (Legacy — ยังไม่แตะ)

```text
index.html            15 KB   page shell + views ทั้งหมด
src/style.css         14 KB   design tokens + glassmorphism
src/js/app.js         15 KB   lifecycle, dashboard, form, detail logic
src/js/api.js          4 KB   GAS HTTP client (URL hard-code)
src/js/state.js        4 KB   localStorage "cosplayProjects"
src/js/ui.js          11 KB   DOM rendering, toast, theme
src/js/image.js        3 KB   DEAD CODE — ไม่เคยถูกเรียก
gas/Code.gs            6 KB   CRUD + Sheets
```

**ยังไม่มี:** `package.json`, `vite.config.js`, `src/main.jsx`, `src/App.jsx`, `.env`, `firebase.json`, `firestore.rules`, `storage.rules`

---

## Firebase Project

*ยังไม่สร้าง* (ต้องทำใน T06)

- project alias: *ยังไม่ตั้ง*
- Auth: ยังไม่เปิด Email/Password
- Firestore / Storage / Hosting: ยังไม่ init

---

## Environment Variables

*ยังไม่ตั้งค่า* (ต้องทำใน T05)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

`.gitignore` **มี `.env` / `.env.local` แล้ว** ✅ แต่ยังไม่มี `.env.*.local`

---

## Next Actions

1. **T03** — สร้างโครงสร้าง folder React + ร่าง `docs/architecture.md`
2. **T04** — `npm init` + ติดตั้ง Vite + React + React Router
3. **T05** — `.env.example` + อัปเดต `.gitignore`
4. **T06** — สร้าง Firebase project (ต้องใช้ browser login)
5. **T07–T09** — SDK init + schema doc + constants

> ⏸️ ตัดสินใจ ?1–?8 ก่อน T09 (constants) เพราะมีผลกับ schema

---

## Known Issues / Blockers

- ⏸️ **ยังไม่ได้ push ขึ้น remote** — branch/tag อยู่ในเครื่องเท่านั้น
- ⏸️ **T06 ต้องใช้ browser login** Firebase Console — ทำแทนไม่ได้
- ⏸️ **ส่วนที่ต้องยืนยันด้วยการรันเว็บจริง** ยังค้าง (ดูหัวข้อ "ต้องยืนยัน" ด้านบน)

---

*Last updated: 2026-09-29 — หลังจบ T02, เสริม legacy-behavior.md ด้วย GAS contract*
