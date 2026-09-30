# Structure Overhaul — โครงสร้างเว็บ + โครงสร้างโค้ด

**วันที่:** 2026-09-30 · **สถานะ:** เฟส 1 อนุมัติแล้ว (ผู้ใช้: "ลองทำมาให้ดูก่อน") · **แนวทาง:** B (แก้เจาะจุด ไม่ย้ายโฟลเดอร์) · **แบ่ง 2 เฟส**

> ที่มาจากการตรวจโครงสร้างปัจจุบันที่พบจุด "ไม่สมเหตุสมผล" 9 จุด
> (ดูหัวข้อ "สิ่งที่พบ" ท้ายเอกสาร)

## เป้าหมาย

ทำให้โครงสร้างเว็บ "อ่านรู้เรื่อง" — ผู้ใช้เห็นหน้าที่สอดคล้องกัน และโค้ดไม่มี logic
ซ้ำ/สองทาง/สีสองแหล่ง — โดย **ไม่เปลี่ยนพฤติกรรมเดิมของฟีเจอร์** (สัญญา
`ProjectForm`/`ImageUploader`/`services/*`/security tests ยังอยู่ครบ)

## ขอบเขตที่ตกลงกัน

- **ทั้งสิ่งที่ผู้ใช้เห็น และโครงสร้างโค้ด** (ผู้ใช้เลือก)
- **แบ่ง 2 เฟส** (ผู้ใช้เลือก): เฟส 1 = UI/shell · เฟส 2 = โค้ด
- **Login/Register = แถบบาง** (โลโก้ + ปุ่มสลับธีม ไม่มีเมนู/sidebar) (ผู้ใช้เลือก)
- ไม่ย้ายโฟลเดอร์ (แนวทาง B)

---

## เฟส 1 — โครงสร้างที่ผู้ใช้เห็น

### 1.1 แยก shell (App.tsx เป็น layout route + Outlet)

```tsx
<Routes>
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Route>
  <Route element={<ProtectedRoute />}>          {/* ครอบ 1 ครั้ง แทน 4 */}
    <Route element={<AppLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/projects/new" element={<CreateProject />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/projects/:id/edit" element={<EditProject />} />
    </Route>
  </Route>
  <Route element={<AppLayout />}>                {/* 404 ยังมี navbar = เหมือนเดิม */}
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```

- `AuthLayout` (ใหม่) = แถบบาง: โลโก้ (link `/`) + `ThemeToggle` + การ์ดกลางจอ
- `AppLayout` = ชื่อเดิม `Layout` (rename เพื่อความชัด) — header + sidebar + mobile nav
- `ProtectedRoute` = เปลี่ยนเป็น render `<Outlet />` (เลิกรับ children เป็น prop หลัก)
  — คงพฤติกรรมเดิม: loading → Spin, ไม่มี user → `<Navigate to="/login" state={{from}} replace/>`
- **ไม่เพิ่ม breadcrumb** (เมนู 2 รายการ ยังไม่คุ้ม — YAGNI)

### 1.2 `<PageContainer>` — กรอบ/ความกว้างมาตรฐานเดียว

```tsx
<PageContainer width="default">   // max 1280 (--container-max) + padding responsive
<PageContainer width="form">      // max 720
<PageContainer width="bare">      // ไม่จำกัด (AuthLayout จัดการเอง)
```

| หน้า | เดิม | ใหม่ |
|---|---|---|
| Dashboard | `maxWidth: 1200px` inline | `default` (1280) |
| ProjectDetail | `.container container-narrow` (720) | `default` (1280) + `.prose`-like inner max 760 สำหรับข้อความ |
| CreateProject / EditProject | `padding 1.5rem, maxWidth 720` เขียนซ้ำ | `form` |
| NotFound | ไม่มี wrapper | `default` |
| Header | `.container` (1200) | ย้ายมาใช้ `PageContainer`-level width เดียวกัน → header กับเนื้อหาตรงกัน |

`.container` ใน `layout.css` → ใช้ `var(--container-max)` (1280) แทนเลข 1200 เพื่อให้
Header กับ PageContainer หน้ากว้างเท่ากัน

### 1.3 `<PageState>` — สถานะหน้า 1 แบบเดียว

```tsx
<PageState status="loading" />
<PageState status="error" message={err} onRetry={...} />
<PageState status="notFound" />     // 404 + ปุ่มกลับหน้าหลัก
<PageState status="empty" description="..." action={<Button/>} />
```

- แทน: `common/Loading.tsx`, `common/ErrorMessage.tsx`, และ `Result` ที่เขียนซ้ำใน
  EditProject/ProjectDetail/NotFound → **ลบ 2 ไฟล์เดิม** (ไม่มี caller หลังแทนที่)
- `NotFound` ใช้ `PageState status="404"` → markup เดิม (title "404", subTitle มี
  "ไม่พบหน้านี้", extra = `<Link to="/">` → `href="/"`) ⇒ **`NotFound.test.tsx` ผ่านโดยไม่แก้**
- ปุ่ม "กลับหน้าหลัก" ของ error/notFound = `navigate('/')` ผ่าน prop `backTo` (default `/`)

### 1.4 `<ErrorBoundary>` — กันหน้าขาว

- class component + `getDerivedStateFromError` + `componentDidCatch` (console.error)
- ครอบ `<Routes>` ใน `App.tsx` (หลัง providers) — ทั้งแอป
- Fallback = `PageState status="error"` + ปุ่ม "ลองใหม่" (`location.reload()`)
- ไม่มี route ใหม่ / ไม่แตะ service

### 1.5 เมนู 1 แหล่ง

- `src/config/nav.ts` → `NAV_ITEMS` = `[{ key:'/', icon, label:'หน้าหลัก' }, { key:'/projects/new', … }]`
- `Sidebar` + `MobileNav` อ่านจากที่นี่ (เลิกประกอบซ้ำ 2 ที่)
- `ProjectDetail` ปุ่ม "กลับ": `navigate(-1)` → `<Link to="/">` (ทำนายได้ ไม่พึ่ง history)

### 1.6 ขอบเขตหน้าที่ยังไม่แก้ (ตั้งใจ)

- Detail ไม่เพิ่ม breadcrumb
- ไม่เปลี่ยนสี/ฟอนต์/ธีม (คง design system ปัจจุบัน)
- ไม่แตะ `services/*`, `utils/{validation,errors,image,constants,formatters,projectStats,projectFilters}.ts`,
  Firestore rules, `security-test` doc

---

## เฟส 2 — โครงสร้างโค้ด (ยังไม่เริ่ม — รอผู้ใช้ดูผลเฟส 1 ก่อน)

| # | งาน | ผลลัพธ์ | หมายเหตุ |
|---|---|---|---|
| 2.1 | `useProjectSubmit` hook | ตัด submit logic ซ้ำ ~40 บรรทัด (submitLock + upload + toast) จาก Create/Edit | create กับ edit ต่างกันแค่เรียก `create`/`update` + เงื่อนไข imageUrl |
| 2.2 | รวมรายการสินค้า | `ItemList` เป็นตัวเดียว (มี `readOnly` แล้ว) · `ProjectItems.tsx` กลายเป็น wrapper `<ItemList readOnly />` | **คงไฟล์ไว้** เพราะ `shopLinkRender.test.tsx` import อยู่ (ห้ามแก้เทสต์) |
| 2.3 | แยก `ImageUploader` (260 → hook + UI) | `hooks/useImageSelection.ts` (state/validate/processImage/revoke) + UI ~120 บรรทัด | revoke/unmount cleanup ต้องเหมือนเดิมทุกจุด |
| 2.4 | กันสี drift | test เทียบ hex ใน `antdTheme.ts` ↔ `tokens.css` | เคยต้องแก้ `colorBorderSecondary` เอง = หลักฐานว่าต้องมี guard; ไม่เปลี่ยนวิธีธีม (กัน FOUC) |
| 2.5 | ทบทวนโฟลเดอร์ | ย้ายเฉพาะที่ชัด (เช่น `components/dashboard/*` → รวมใน `pages/Dashboard/`) | เลื่อนได้ ถ้าเฟส 1 ดูดีแล้ว |

---

## การทดสอบ

- **เทสต์เดิม 32 ตัวต้องผ่านหมด** · `shopLinkRender.test.tsx` + `NotFound.test.tsx` = **ห้ามแก้**
- เทสต์ใหม่ (เฟส 1): `PageState` (markup ทุก status), `PageContainer` (width variant),
  `ErrorBoundary` (fallback เมื่อ child throw), `nav.ts` (items ครบ/ไม่ซ้ำ), `AuthLayout` (มีโลโก้+สลับธีม, ไม่มีเมนู)
- TDD: เขียนเทสต์ก่อน แล้วค่อยแก้โค้ด
- **Gates ทุกจุด:** `npm run build` ✓ · `npm run lint` ✓ · `npm test` ✓ · `node scripts/rules-smoke-test.mjs` (18/18)
  (imgbb-smoke 6/6 เมื่อแตะ path อัปโหลดรูป)

## ข้อบังคับคงเดิม (จาก user)

- **ไม่ commit** — ทุกอย่างอยู่ใน working tree บน `migration/react-firebase`
- **หยุดก่อน M8 / T41–T52** — ไม่ deploy โดยไม่ถาม
- ไม่แตะ `firebase-tools`/global install
- `src/utils/image.ts` (≤5MB), `validation.ts`, `errors.ts`, `services/*`, Firestore rules = ห้ามแตะ
- antd static methods (message/modal/notification) = ห้าม — ใช้ `App.useApp()` เท่านั้น
- UI ห้ามผูก Firestore ตรง ๆ · ห้ามใส่ Base64 ใน DB

---

## สิ่งที่พบ (9 จุดที่ตรวจเจอ)

1. Login/Register อยู่ใต้ Layout (เห็น navbar + sidebar ก่อน login)
2. 4 วิธีกำหนดความกว้างหน้า (`.container` / `.container-narrow` / `maxWidth:720` / การ์ด 420)
3. `ProtectedRoute` ครอบซ้ำ 4 จุด
4. โค้ดซ้ำ: state block Edit/Detail ~30 บรรทัด + submit logic Create/Edit ~40 บรรทัด
5. `ItemList` (มี `readOnly`) กับ `ProjectItems` ทำหน้าที่เดียวกันแต่แยกไฟล์
6. สี hex ซ้ำ 2 แหล่ง (`antdTheme.ts` ↔ `tokens.css`)
7. เมนูประกอบซ้ำ 2 ที่ (Sidebar/MobileNav)
8. ไม่มี ErrorBoundary → พัง = หน้าขาว
9. `ImageUploader` 260 บรรทัด ผสม logic กับ UI
