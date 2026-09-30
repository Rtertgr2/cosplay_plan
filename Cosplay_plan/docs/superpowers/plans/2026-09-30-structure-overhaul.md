# Plan — Structure Overhaul เฟส 1 (โครงสร้างที่ผู้ใช้เห็น)

**Spec:** `docs/superpowers/specs/2026-09-30-structure-overhaul-design.md` · **เฟส 1 อนุมัติแล้ว 2026-09-30**
**Ledger:** `docs/superpowers/plans/2026-09-30-structure-overhaul.progress.md` · เฟส 2 รอผู้ใช้ดูผลเฟส 1

> ทุก task = TDD (เขียนเทสต์ก่อน) · ไม่มี commit · gates = `build` + `lint` + `test` + rules-smoke(18)

## Task ตามลำดับ

- [ ] **T1** `src/config/nav.ts` — `NAV_ITEMS` จุดเดียว (`key`/`icon`/`label`) + test (ครบ 2 รายการ · path unique · label ไทย)
- [ ] **T2** `components/common/PageContainer.tsx` — `width: default(1280) | form(720) | bare` + padding responsive + test (style ตรง variant)
- [ ] **T3** `components/common/PageState.tsx` — `loading | error | notFound | 404 | empty` จุดเดียว แทน `Loading`/`ErrorMessage`/Result ที่เขียนซ้ำ + test (markup ทุก status · ปุ่ม back)
- [ ] **T4** `components/layout/AuthLayout.tsx` — แถบบาง (โลโก้ + ThemeToggle) + `<Outlet/>` + test (มี `href="/"` + ปุ่มสลับธีม · **ไม่มี** เมนู `หน้าหลัก`)
- [ ] **T5** `components/common/ErrorBoundary.tsx` — class boundary + fallback (PageState error + ลองใหม่) + test (child throw → แสดง fallback)
- [ ] **T6** โครง route: `App.tsx` เป็น layout route (`AuthLayout` / `ProtectedRoute`+`AppLayout` / `*`→NotFound) · `ProtectedRoute` เป็น `<Outlet/>` · rename `Layout`→`AppLayout` · ครอบ `ErrorBoundary` · `Sidebar`/`MobileNav` อ่าน `NAV_ITEMS`
- [ ] **T7** ย้ายหน้าใช้ของกลาง: Dashboard/ProjectDetail → `PageContainer default` · Create/Edit → `form` · NotFound → `PageState 404` (test เดิมต้องผ่าน) · Detail ปุ่มกลับ = `<Link to="/">` · ลบ `common/Loading.tsx` + `common/ErrorMessage.tsx` · `layout.css` `.container` = `var(--container-max)`
- [ ] **T8** ปิดเฟส 1: gates ทั้งหมด + grep ยืนยัน (ไม่มี `navigate(-1)` · ไม่มี `maxWidth` ซ้ำใน pages · ไม่มี import `Loading/ErrorMessage`) + สรุปให้ผู้ใช้ตรวจในเบราว์เซอร์

## จุดระวัง (จาก spec)

- `shopLinkRender.test.tsx` / `NotFound.test.tsx` = **ห้ามแก้** (PageState ต้องคง markup: title "404" · subTitle มี "ไม่พบหน้านี้" · extra มี `href="/"`)
- 404 อยู่ใต้ `AppLayout` = พฤติกรรมเดิม
- ห้ามแตะ `services/*`, `utils/{validation,errors,image}.ts`, rules, `image.ts`
- antd static methods ห้าม — `App.useApp()` เท่านั้น
- Header กับหน้าต้องกว้างเท่ากัน (`.container` → `var(--container-max)` = 1280)
