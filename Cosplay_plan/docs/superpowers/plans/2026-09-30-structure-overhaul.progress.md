# Progress — Structure Overhaul

**Spec:** `docs/superpowers/specs/2026-09-30-structure-overhaul-design.md` · **Plan:** `2026-09-30-structure-overhaul.md`
**อนุมัติ:** ผู้ใช้เลือก (ทั้งหน้าเว็บ+โค้ด · แบ่ง 2 เฟส · แนวทาง B · login=แถบบาง) → "ลองทำมาให้ดูก่อน"

## เฟส 1 — โครงสร้างที่ผู้ใช้เห็น ✅ 8/8 tasks

- [x] **T1** `src/config/nav.tsx` — `NAV_ITEMS` จุดเดียว (Sidebar + MobileNav) · test 3 เคส
- [x] **T2** `components/common/PageContainer.tsx` — `default|form|bare` อ้าง token (`--container-max`/`--container-form`) · test 4 เคส
- [x] **T3** `components/common/PageState.tsx` — `loading|error|notFound|404|empty` · ไม่พึ่ง router · test 5 เคส
- [x] **T4** `components/layout/AuthLayout.tsx` — แถบบาง + `<Outlet/>` · test 3 เคส (ยืนยัน "ไม่มีเมนู/ไม่มีปุ่มออกจากระบบ")
- [x] **T5** `components/common/ErrorBoundary.tsx` — class boundary + `ErrorFallback` แยกให้ทดสอบได้ · test 2 เคส
- [x] **T6** โครง route: `App.tsx` = layout routes (`AuthLayout` / `ProtectedRoute`+`AppLayout` / `*`) · `ProtectedRoute` เป็น `<Outlet/>` · `Layout`→`AppLayout` · ครอบ `ErrorBoundary` · Sidebar/MobileNav อ่าน `NAV_ITEMS` · `.container` = `--container-max` + padding ตรง `.page-container`
- [x] **T7** ย้าวหน้า: Dashboard/Detail → `PageContainer` · Create/Edit → `form` · NotFound → `PageState 404` · Login/Register ตัด wrapper เอง (AuthLayout จัดวาง) · Detail ปุ่มกลับ = `href="/"` · **ลบ `common/Loading.tsx` + `common/ErrorMessage.tsx`** · ลบ `.container-narrow/.container-wide` (ไม่มี caller) · เพิ่ม token `--container-form`/`--container-auth`
- [x] **T8** ปิดเฟส: gates + grep verify + ส่งผู้ใช้ตรวจเบราว์เซอร์

**Gates:** build ✓ · lint ✓ · **tests 49/49** (13 ไฟล์ = 32 เดิม + 17 ใหม่) · rules-smoke **18/18** · dev server 200
**ห้ามแตะ (คงเดิม):** `shopLinkRender.test.tsx` / `NotFound.test.tsx` ไม่ถูกแก้ — ทั้งคู่ผ่าน

## Deviations / บันทึกระหว่างทาง

1. `NavItem` เป็น **type alias ไม่ใช่ interface** — antd `MenuItemType` สืบทอด `DataAttributes` (มี index signature) ซึ่ง TS ให้ implicit index signature เฉพาะ type alias
2. `AppLayout` เป็น layout route → ต้อง render `<Outlet/>` เอง (ไม่รับ `children`) — แก้ TS2741
3. `PageState` เพิ่มพฤติกรรม: `error` ที่มี `onRetry` → ปุ่ม "ลองใหม่"; ไม่มี → ปุ่ม "กลับหน้าหลัก" (เดิม Edit/Detail ใช้ label "กลับหน้าหลัก" ทั้งที่ prop ชื่อ retry = ความหมายผิด)
4. เพิ่ม token `--container-form: 720px` / `--container-auth: 420px` — ไม่ hardcode ตัวเลขใน page
5. `.container` padding เพิ่ม media query ให้ตรง `.page-container` (เดิม 16px vs 24px → header ไม่ตรงเนื้อหา 8px)
6. `ErrorBoundary` ทดสอบ fallback แยก เพราะ `renderToStaticMarkup` (SSR) ไม่ catch render error — เขียนหมายเหตุไว้ในเทสต์
7. หน้า Detail: เนื้อหาจำกัดคอลัมน์ `var(--container-form)` (720) ตอน hero เต็มความกว้าง — ตามสเปค (อ่านสบายตา)

## เฟส 2 — โครงสร้างโค้ด ⏸ รอผู้ใช้ตรวจเฟส 1 ก่อน

`useProjectSubmit` · รวม `ItemList`/`ProjectItems` (ProjectItems กลายเป็น wrapper — คงไฟล์ไว้เพราะ test import) · แยก `useImageSelection` จาก ImageUploader · sync-guard test สี `antdTheme.ts` ↔ `tokens.css`

## สถานะรวม

- **ไม่มี commit** (ตามคำสั่ง user) · หยุดก่อน M8/T41–T52 · ไม่แตะ `services/*`, `utils/{validation,errors,image}.ts`, rules
