# Execution Ledger — Ant Design Redesign (Native / executing-plans)

Plan: `docs/superpowers/plans/2026-09-30-antd-redesign.md`
Branch: `migration/react-firebase` — **ห้าม commit ทุก task**

## Task status

- [x] Task 1: Theme foundation (deps + antdTheme + ThemeContext + provider chain) — gates ✓ 31/31
- [x] Task 2: tokens.css — เพิ่ม block โทนใหม่คู่ของเดิม — build ✓ 31/31
- [x] Task 3: Shared — ConfirmDialog → Modal, Loading → Spin, ErrorMessage → Result (ลบ Modal.tsx) — gates ✓ 31/31
- [x] Task 4: Toast → antd notification (ลบ Toast.tsx, slim {addToast}, TOAST_DISMISS_MS export) — gates ✓ 32/32
- [x] Task 5: Shell — Layout/Header/Sidebar/MobileNav/ThemeToggle (class sidebar/mobile-nav คง, gates ✓ 32/32)
- [x] Task 6: Dashboard ทั้งหน้า (+STATUS_TAG_COLOR) — gates ✓ 32/32 (deviation: SearchBar ใช้ Input+prefix แทน Input.Search — กันไอคอนซ้ำ)
- [x] Task 7: Project form components (StatusSelect/ProjectForm/ImageUploader/ItemForm/ItemList) — gates ✓ 32/32, shopLinkRender 4/4 unmodified
  - note: ImageUploader — Dragger `openFileDialogOnClick={false}` กัน dialog ซ้ำ, zone คง role/tabIndex/aria/คลิก/Enter, drop ไม่ handleFile ซ้ำตอนมี Dragger, `hasControlInside` (ค่า default) กัน double tab-stop
- [x] Task 8: Create + Edit render layer (Typography/Alert/Result/Loading; submit logic ไม่แตะ) — gates ✓ 32/32
- [x] Task 9: Project Detail + ProjectHero/Status/Note/Items (security guard คง) — gates ✓ 32/32
- [x] Task 10: Auth — Login + Register (Form/rules เรียก validator เดิม, ข้อความชุดเดิม) — gates ✓ 32/32
- [x] Task 11: NotFound → Result 404 — test ผ่าน unmodified ✓, gates ✓ 32/32
- [x] Task 12: CSS finalization — ลบ components.css + block token เก่า, rename globals ครบ, `var()` ทุกตัว resolve ✓, ProtectedRoute spinner→Spin — gates ✓ 32/32
  - note: เพิ่ม `--z-sticky: 20` เป็น extension (Header/MobileNav ใช้); `--color-muted`(scrollbar track) → `--border-soft`, `--color-secondary`(a:hover) → `--accent-hover`
- [x] Task 13: Final gates + บันทึก + ส่งมอบ — build/lint ✓, tests 32/32, rules 18/18, imgbb 6/6, bundle raw 1,635,411 B (gzip 502KB, baseline 857,855), memory.md + TASKS sync ✓

**สถานะ: ครบ 13/13 tasks ✓ (2026-09-30) — ค้าง: browser checklist 9 ข้อ + code review + final acceptance (T44)**

## Notes / blockers

- **Task 1 deviation**: antd v6 ไม่มี token `borderRadiusXL` (type `AliasToken` ไม่มี — v5 มี)
  → ตัดออกจาก `createAntdTheme` (LG=16 ครอบ component ใหญ่สุดแทน) · ค่า `20` ยังอยู่ใน
  `--radius-xl` ของ tokens.css (Task 2) สำหรับ CSS ที่ antd ไม่ครอบ — spec 00-overview ตาราง
  `borderRadius/LG/XL/SM` อ่านเป็น "เท่าที่ v6 รองรับ"
- **Task 2 notes**:
  - ชื่อ `--space-*` / `--radius-*` ชน block เดิมโดยตั้งใจ (block ใหม่อยู่หลัง → ชนะ) — ค่า space
    เท่ากันพอดี (4–48px), radius ใหม่ 10/16/20 ชนะ 4/6/8 (cosmetic ระหว่าง transition — component
    เก่าโดนแทนใน Task 12)
  - extension ที่เติมนอกเหนือ plan: `--font-sans` (globals ใช้ 1 จุด — alias ฟอนต์ Inter),
    `--space-16: 64px` (มีคนใช้ 1 จุด), น้ำหนักตัวอักษร 3 ค่า (plan ระบุเอง)
  - dark `--fg-2 #dfe3e9` / `--border-soft #202530` = derive จาก kit.dark palette (kit ไม่ได้ให้ค่า)
  - dark `--elev-raised` = ค่า panel shadow จาก kit.dark.html (`0 24px 80px rgba(15,17,23,.32)`)
  - `--radius-xl`/`--radius-full` มีคนใช้อยู่ (1+2 จุด) → Task 12 rename `--radius-xl→--radius-lg`,
    `--radius-full→--radius-pill`
