# Memory — Cosplay Planner Migration

> บันทึกความคืบหน้า งานที่เสร็จแล้ว และบริบทสำคัญ
> อัปเดตทุกครั้งที่จบ task / milestone

---

## Project Status

- **Current Phase:** Phase 1 — Baseline / Foundation
- **Current Task:** T01 — Freeze Existing Behavior (IN PROGRESS)
- **Branch:** `main` (ยังไม่สร้าง `migration/react-firebase`)
- **Last Commit:** `bfec9e0 update_v2`

---

## Completed Tasks

### T01 — Freeze Existing Behavior ✅
- [x] อ่านโค้ด legacy ทั้ง 7 ไฟล์ (index.html, src/js/*, gas/Code.gs)
- [x] บันทึกพฤติกรรมครบใน `docs/legacy-behavior.md` (Feature list, Data fields, Behavior details, Known limitations, GAS API contract, Files to archive, Acceptance criteria)

---

## In Progress

*ไม่มี (พร้อมไป T02)*

---

## Key Decisions / Context

- Legacy stack: Vanilla HTML/JS + Google Apps Script + Google Sheets
- Target stack: React + Vite + Firebase (Firestore, Storage, Auth, Hosting)
- Migration principle: สร้าง layer ใหม่ขนาน → ย้าย data ก่อน UI → ลบ legacy ทีหลัง

---

## Next Actions

1. เสร็จ T01: ทดสอบเว็บเดิม + เขียน `docs/legacy-behavior.md`
2. T02: สร้าง branch `migration/react-firebase` + tag `legacy-before-react-migration`
3. T03: สร้างโครงสร้าง folder React
4. T04: ติดตั้ง Vite + React
5. T05: ตั้งค่า `.env` strategy

---

## Known Issues / Blockers

*ยังไม่มี*

---

## File Inventory (Legacy)

```
index.html
src/js/app.js
src/js/api.js
src/js/state.js
src/js/ui.js
src/js/image.js
src/style.css
gas/Code.gs
```

---

## Firebase Project

*ยังไม่สร้าง*

---

## Environment Variables

*ยังไม่ตั้งค่า*

---

## Notes

- `Cosplay_Planner_Detailed_Tasks.md` = แผนต้นฉบับ (3,362 บรรทัด)
- `TASKS.md` = checklist แบบแตก subtask (เพิ่งสร้าง)
- `memory.md` = ไฟล์นี้ (อัปเดตต่อเนื่อง)