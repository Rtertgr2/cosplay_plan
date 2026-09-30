# SDD ledger — plan: docs/superpowers/plans/2026-09-30-cosplan-product-redesign.md

**Spec:** `docs/superpowers/specs/2026-09-30-cosplan-product-redesign-design.md`
**Execution:** Native (inline) · **ไม่มี commit** (คำสั่งผู้ใช้) → ledger นี้คือ record
**Started:** 2026-09-30

## Pre-flight (shared interfaces)

| Task ผู้ผลิต | Task ผู้บริโภค | ตรวจพบ |
|---|---|---|
| T2 `progressOf` / `spentOf` / `isOverBudget` | T5 ProjectCard · T6 Detail | ชื่อ/ชนิดตรงกัน ✓ |
| T3 `AuthContext.displayName` | T4 Dashboard greeting | T4 ต้องอ่าน `displayName` จาก context (fallback email) — ถ้า T3 ไม่ expose ให้ T4 จะ undefined |
| T6 `copyText(text): Promise<boolean>` | T6 Detail | ผลิต+บริโภคใน task เดียว ✓ |
| T4 route `/projects` | T4 nav + Dashboard "ดูทั้งหมด" | ผลิต+บริโภคใน task เดียว ✓ |

## Rulings (ก่อน Task 1)

- **Ruling: ไม่สร้าง worktree** — งานทั้งหมดยัง **ไม่ commit** อยู่ใน working tree นี้; worktree ใหม่จะไม่มีไฟล์เหล่านั้น → คงทำในที่เดิม (branch `migration/react-firebase`) · ถ้าผิด = งานหาย/ต้องย้ายกลับ
- **Ruling: ขั้น "Commit" ในแผน → gates + ledger** — ผู้ใช้ห้าม commit; skill ทุกตัวบอกให้ทำตาม commit steps ของแผน แผนนี้กำหนด gates แทน ✓
- **Ruling: script `task-start`/`task-done` ใช้ไม่ได้** — ต้องใช้ git BASE/commit; ทำทีละขั้นแบบ manual (เขียนเทสต์ → รันเห็น fail → ลงโค้ด → รันเห็น pass → gates → เขียนบรรทัดนี้) · ถ้าผิด = ledger ขาดรายละเอียดกว่าปกติเล็กน้อย
- **Ruling: Task 3 ใช้ `updateProfile` (Firebase Auth) ไม่แตะ `firestore.rules`** — ผู้ใช้ตอบ "เริ่มเลย" หลังผมแนะนำทางนี้ (ไม่ต้องแก้ rules = ลดความเสี่ยง security) · ถ้าผิด = ต้องย้อนมาเพิ่ม `match /users/{userId}` + smoke 2 เคส

## Tasks

- **Task 1: Brand tokens + default dark — ✅ complete** (tests: `npm test` → 53/53 pass · build ✓ · lint ✓ · rules-smoke 18/18)
  - RED: อัปเดต `antdTheme.test.ts` (4 เคส) + `ThemeContext.test.tsx` (4 เคส) → เห็น fail ด้วยค่าเก่า (`#ff6b00`, `#0f1115`, radius 10, default `light`) แล้วจึงลงโค้ด
  - เขียน: `tokens.css` (ม่วง/นิวทรัล light+dark, type 13–48, radius 8/12/16/24, elevation + `--elev-card`), `antdTheme.ts`, `ThemeContext.getInitialTheme` = stored ?? `'dark'`
  - **Ruling: เทสต์ storage ต้อง stub `window` ด้วย** — `getInitialTheme` ข้าม localStorage ตอนไม่มี `window` (SSR) → เทสต์แรกจึงผ่านผิดเหตุ · แก้โดย stub ทั้ง `window`+`localStorage` (ถ้าไม่แก้ = ไม่มีการกัน regression ตอนคนอื่นใส่ OS preference กลับมา)
  - **Ruling: `--purple` เปลี่ยนเป็น `#4c1d95`** — accent ม่วงแล้ว gradient hero (accent→purple) เดิมจะเป็นม่วง→ม่วงจาง · ใช้เฉดเข้มกว่าแทน (สเปคไม่ได้ระบุค่านี้)
  - **Ruling: `--focus-ring` เปลี่ยนเป็น `rgba(124,58,237,0.32)`** — สเปคไม่ได้ให้ค่า; ต้องเป็นม่วงตาม accent ไม่ใช่ส้มเดิม
  - **Ruling: dark elevation เข้มกว่า light** — `--elev-card/-raised` ในโหมดมืดใช้ `rgba(0,0,0,0.5)` (บนพื้นเกือบดำเงาจางเกินไป) · ถ้าผิด = เงามืดจะดูจางกว่าที่ควร (ปรับตัวเลขได้)
  - → ผู้ใช้รีเฟรชดูหน้าเว็บ (สีม่วง + เข้าเว็บแล้วเป็นโหมดมืดทันที) แล้วค่อย Task 2

- **Task 2: progress/spent pure fns + `item.done` — ✅ complete** (tests: `npm test` → 65/65 · build ✓ · lint ✓)
  - RED: `projectProgress.test.ts` 11 เคส → เห็น `Cannot find module` แล้วจึงเขียนโค้ด
  - เขียน `utils/projectProgress.ts` (`progressOf`/`spentOf`/`isOverBudget`) + `ProjectItem.done?: boolean`
  - ครอบ edge case ตาม Review Focus #1–2 (ข้อมูลเก่าไม่มี `done`, budget 0, เกินงบ) — `firestore.rules` **ไม่ต้องแก้** (rules ตรวจแค่ `items is list`)

- **Task 3: displayName ผ่าน Firebase Auth — ✅ complete** (tests: `npm test` → 69/69 · build ✓ · lint ✓ · rules-smoke 18/18 · `firestore.rules` ไม่ถูกแก้ ✓)
  - RED เห็นแล้วก่อนลงโค้ด: `updateProfile` ไม่ถูกเรียก (assertion fail ตามคาด)
  - เขียน `context/authActions.ts` (`registerWithDisplayName`) · `AuthContextValue.displayName` · field "ชื่อ (ไม่บังคับ)" ใน Register · Header แสดง `displayName ?? email`
  - **Ruling: ย้าย logic ออกเป็น `authActions.ts`** — เขียนเทสต์ผ่าน React ต้อง assign ตัวแปรนอก component ใน Probe → eslint `react-hooks/globals` error; แยกเป็นโมดูลแล้วเทสต์ตรง logic ได้ (assertion เดิมทั้ง 4 เคส) · ถ้าผิด = โค้ดซ้ำซ้อนเพิ่ม
  - **Deferred: fallback "displayName → email" ไม่ได้ทำเป็นเทสต์** — SSR ไม่รัน effect ของ `onAuthStateChanged` จึงทดสอบผ่าน provider ไม่ได้ · ตรวจด้วยตาในเบราว์เซอร์แทน (Task 7 checklist)

- **Task 4: Dashboard workspace + หน้า /projects — ✅ complete** (tests: `npm test` → 76/76 · build ✓ · lint ✓ · rules 18/18)
  - RED: `nav.test` ไม่มี `/projects` + `Dashboard.test`/`Projects.test` ไม่มีเนื้อหา workspace/หน้าใหม่
  - เพิ่ม `pages/Projects.tsx` (ค้นหา+กรอง+เรียงใหม่สุด) · `Dashboard.tsx` เป็นภาพรวม · `NAV_ITEMS` 3 รายการ · route `/projects` · ย้ายการ์ดค้นหาออกจาก Dashboard
  - ย้าย `DashboardHeader` → `common/PageHeader` (ใช้ข้ามหน้า ชื่อเดิมทำให้สับสน) + ลบไฟล์เดิม
  - **Ruling: ทดสอบ "6 ล่าสุด" ด้วยข้อมูลที่โปรเจกต์-1 ใหม่ที่สุด** — ถ้าเรียงวันที่ผิดข้อมูลจะผ่านแม้โค้ดผิด · ถ้าผิด = เทสต์จะไม่จับการเรียงผิด
  - **Ruling: เปลี่ยนชื่อแบรนด์เป็น COSPLAN ใน Task นี้** (Header/AuthLayout/index.html) — D2 อนุมัติชื่อไว้ แต่แผนไม่ได้ผูกไว้กับ task ใด; RED เห็นผ่าน `AuthLayout.test` · ถ้าผิด = ชื่อไม่ตรงแบรนด์ในหน้าสาธารณะ (V4)

- **Task 5: ProjectCard = portfolio item — ✅ complete** (tests: `npm test` → 81/81 · build ✓ · lint ✓)
  - RED: 5 เคส (progress/spent/เกินงบ/0%/เมนู) fail ก่อนลงโค้ด
  - เพิ่ม Progress + `spent / budget` + ป้าย `เกินงบ ฿X` + เมนู `⋮` (Dropdown แก้ไข/ลบ) + stopPropagation กันนำไป detail
  - **Ruling: hover ใช้ `--elev-card` ไม่ใช่ `--elev-raised`** — สเปค §4.1 ให้ card shadow อ่อนกว่า elevated; CSS จาก zip ใช้ค่าแรงเกิน · ถ้าผิด = เงาการ์ดหนักเกินจำเป็น

- **Task 6: Detail = showcase — ✅ complete** (tests: `npm test` → 93/93 · build ✓ · lint ✓ · rules 18/18)
  - RED: clipboard/projectItems/ProjectItems 3 ไฟล์ test ไม่มีโมดูล + 3 assertion ไม่ผ่าน
  - เพิ่ม `utils/clipboard.ts` (`copyText` → boolean), `utils/projectItems.ts` (`toggleDoneAt` immutable), `ProjectItems` = checkbox + ปุ่มร้าน (`aria-label` มีชื่อสินค้า), Detail = progress/งบ/คัดลอกลิงก์, `ItemForm` checkbox "ซื้อแล้ว", `ItemList` ขีดฆ่า+ติ๊กเขียว
  - `shopLinkRender.test.tsx` (ห้ามแก้) ผ่าน 4/4 กับ markup ใหม่ ✓
  - **Ruling: toggle ทดสอบผ่าน pure `toggleDoneAt`** — กด checkbox ใน SSR ไม่ได้; ย้ายตรรกะเป็น util แล้วทดสอบ immutability/index นอกเขต · ถ้าผิด = wiring ใน component ไม่มีเทสต์คุม
  - **Ruling: checkbox ใน ItemForm ไม่มีเทสต์เชิงพฤติกรรม** — ต้องการ DOM; payload เป็นฟิลด์ธรรมดา (tsc คุมชนิด) · ตรวจด้วยตาในเบราว์เซอร์
  - ไม่รัน `imgbb-smoke-test` — ไม่ได้แตะ path อัปโหลด/ประมวลผลรูป

- **Task 7: ปิด V1–V3 — ✅ complete** (tests: `npm test` → 93/93 · build ✓ · lint ✓ · rules 18/18)
  - grep: prop ที่ antd deprecate = 0 (เหลือแต่คำอธิบายใน comment) · token เก่า = 0 · raw hex ใน component = 0 · `firestore.rules` = 2 `match /` (ไม่เปลี่ยน)
  - bundle raw 1,637,036 B (เพิ่มจากเดิม 1,635,411 ≈ +1.6KB)
  - อัปเดต `docs/memory.md` แล้ว · ส่ง checklist ตรวจเบราว์เซอร์ให้ผู้ใช้

### บั๊กจากผู้ใช้เจอหลัง Task 7 (แก้แล้ว 2026-09-30)

- **อาการ**: หน้า Detail แสดง ErrorBoundary: `ReferenceError: progress is not defined` (และก่อนหน้านั้น CreateProject เจอ `Checkbox is not defined`)
- **สาเหตุ: ไม่ใช่บั๊กในโค้ด** — โค้ดบนดิสก์ถูกต้องเสมอ (`ProjectDetail.tsx` บรรทัด 64 ประกาศ `progress` ใช้บรรทัด 147) แต่ **dev server เสิร์ฟโมดูลที่ transform ค้าง** จากช่วงที่ผมแก้ไฟล์เดียวกันหลายรอบติดกัน (import ลงแล้ว / โค้ดที่ประกาศตัวแปรยังไม่ลง) → ยืนยันด้วย `curl` ก่อนแก้: โมดูลที่เสิร์ฟมี `import {... progressOf ...}` แต่ `const progress` = **0 ครั้ง**
- **วิธีแก้**: ปิด dev server → `rm -rf node_modules/.vite` → restart → ยืนยันโมดูลที่เสิร์ฟมี `const progress` = 1 · เช็คทุกโมดูลหลัก (6 ไฟล์) ตอบ 200 พร้อม import ครบ
- **Ruling: เพิ่มเทสต์ `pages/ProjectDetail.test.tsx`** — ไม่ใช่ TDD cycle ใหม่ (โค้ดถูกอยู่แล้วจึงผ่านทันที) แต่เป็น regression guard: หน้าที่ซับซ้อนที่สุดเคยพังแบบนี้และไม่มีเทสต์คุมเลย · ครอบคลุม progress/spent/budget + ปุ่มคัดลอกลิงก์ + ปุ่มร้าน + `href="/projects"`
- **ข้อสรุปเชิงกระบวนการ (บันทึกไว้กันซ้ำ)**: ห้ามแก้ไฟล์เดียวกันสองครั้งใน "รอบเดียว" — ถ้าจำเป็นต้องแก้หลายจุด ให้รวบเป็นการเขียนทั้งไฟล์ด้วย `write` หรือรอให้ build ผ่านก่อนแก้จุดถัดไป
- **Gates หลังแก้**: tests **96/96 (22 ไฟล์)** · build ✓ · lint ✓ · rules-smoke 18/18 · imgbb-smoke 6/6 · dev 200

### แก้ตามรีเฟรชจากผู้ใช้: แถบบนสูงเกิน + ปุ่มสลับธีมใหญ่เกิน (2026-09-30)

- **อาการที่ผู้ใช้เจอ**: "navbar ใหญ่เกินไป" + "ปุ่มเปลี่ยนธีมใหญ่เกินไป"
- **สาเหตุ (ไม่ใช่ guess — อ่านโค้ดแล้ว)**:
  1. `Header.tsx` override แค่ `padding` แต่ antd ตั้ง `.ant-layout-header` = `height: 64px; line-height: 64px; padding: 0 50px` → แถบสูง 64px เปล่าๆ + บรรทัดลอยกลาง (line-height เท่าความสูงแถบ)
  2. `ThemeToggle.tsx` hardcode `minWidth/minHeight: 44` (target size สำหรับมือถือ) → ปุ่ม 44px ใหญ่กว่าปุ่มมาตรฐาน 32px **และดันเนื้อหาให้ล้นกรอบ 64px**
- **TDD**: เขียน `layout/Header.test.tsx` 4 เคสก่อน → เห็น fail 3 (ไม่มี `height:56px` / ไม่มี `line-height:normal` / ยังมี `min-width:44px`) แล้วจึงแก้
- **แก้**: header `height: 56` + `lineHeight: 'normal'` + `display:flex; alignItems:center` + `padding: '0 var(--space-4)'` · ThemeToggle ถอด min-size ออก ใช้ `shape="circle"` (32px) · ลบ `className="container"` ที่ตายแล้ว (ไม่มี CSS `.container` ในโปรเจกต์) แล้วใส่ `width: 100%` แทน
- **Ruling: ปุ่ม "ออกจากระบบ" คง `size="small"` ไว้ ไม่แตะ** — ผู้ใช้บอกว่าอยากได้ "เล็กลง" การไปเอา `size="small"` ออกจะทำให้ใหญ่ขึ้น ขัดกับเจตนา · ถ้าภายหลังอยากให้แถบแน่นลงอีก ค่อยจัดขนาดทั้งแถวรอบเดียว
- **Ruling: ไม่แตะ Sidebar (220px) / MobileNav (64px)** — ผู้ใช้บอก "navbar" หมายถึงแถบบนสุด (สังเกตจากที่บันทึกไว้: ปุ่มที่ใหญ่เกินคือปุ่มสลับธีมในแถบนั้น) · ถ้าหมายถึงข้าง/ล่าง → บอกได้ทันที แยกแก้
- **Gates**: tests **100/100 (23 ไฟล์)** · build ✓ · lint ✓ · ยืนยันโมดูลที่ dev server เสิร์ฟตรงกับดิสก์ (ไม่มี `min-width:44px` เหลือ) · ยังไม่ commit

## สถานะรวม V1–V3

- เหลือ **V4–V7** (Landing/PublicLayout + route `/`→`/dashboard`, ฟอร์ม 5 ขั้น, Skeleton, polish/a11y/QA) → ต้องเขียนแผนแยกหลังผู้ใช้ตรวจ V1–V3 ในเบราว์เซอร์
- ยัง **ไม่ commit** ทั้งหมด · หยุดก่อน M8/T41–T52 · `firestore.rules`/`services/*` ไม่ถูกแก้เลย (ตาม amendment)

