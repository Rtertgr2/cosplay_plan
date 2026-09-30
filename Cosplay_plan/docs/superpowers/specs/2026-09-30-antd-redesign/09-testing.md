# 09 — Testing & Verification

## Gates (ทุกอันต้องผ่าน (เขียว) ก่อนถือว่าเสร็จ — เหมือนงานที่ผ่านมา)

| Gate | Command | สถานะก่อน redesign | หลัง redesign |
|---|---|---|---|
| Build (strict tsc) | `npm run build` | ✅ ผ่าน | ต้องผ่าน |
| Lint | `npm run lint` | ✅ ผ่าน | ต้องผ่าน |
| Unit tests | `npm test` | ✅ 27/27 | ต้องผ่าน (ดู test matrix ล่าง) |
| Rules smoke | `node scripts/rules-smoke-test.mjs` | ✅ 18/18 | ต้องผ่าน (ไม่เกี่ยวกับ UI — regression) |
| ImgBB smoke | `node scripts/imgbb-smoke-test.mjs` | ✅ 6/6 | ต้องผ่าน (ไม่เกี่ยวกับ UI — regression) |

## Test matrix — test ที่มีอยู่ 5 ไฟล์ 27 cases

| Test file | กระทบไหม | แผน |
|---|---|---|
| `utils/validation.test.ts` | ❌ ไม่กระทบ | validation.ts ไม่แตะ — ผ่านเหมือนเดิม |
| `utils/errors.test.ts` | ❌ | ไม่แตะ |
| `services/storageService.test.ts` | ❌ | ไม่แตะ |
| `project/shopLinkRender.test.tsx` | ⚠️ **กระทบ** — render `ProjectItems` + `ItemList` ด้วย `renderToStaticMarkup` | internals เปลี่ยนเป็น antd `List`/`Card` → markup ต่างแต่ **assertion ความหมายต้องคง**: (ก) `javascript:` link ไม่สร้าง `<a`, (ข) https link สร้าง `href` + `rel="noopener noreferrer"` — ถ้า antd ห่อ anchor ต่างไป → แก้แค่ตัว string ที่ assert ให้ตรง markup จริง **แต่ห้ามอ่อนข้อ** เรื่อง security guard |
| `pages/NotFound.test.tsx` | ⚠️ **กระทบ** — assert `404`, `ไม่พบหน้านี้`, `href="/"` | `Result` ต้องคง string ทั้งหมด (ดู `07-notfound.md`) — ถ้า markup เปลี่ยน → ปรับ test ให้คงความหมายเดิม |

**ข้อบังคับร่วมของ 2 test ที่กระทบ**: ห้ามลบ/อ่อนข้อ assertion เรื่อง security (javascript: link, rel, ข้อความไทย) — ปรับได้เฉพาะวิธี match markup

### antd ใน vitest (`renderToStaticMarkup`, node env)
- antd v6 ทำงานใน SSR/static render ได้ (CSS-in-JS มี server path) — ปัจจุบัน test ไม่มี jsdom และ **ไม่มี setupFiles**
- ความเสี่ยง: component บางตัวเรียก `window`/`matchMedia` ตอน render → **แผน**: ถ้า test พังด้วยเหตุนี้ → เพิ่ม `test.setup.ts` polyfill (`window.matchMedia`, `getComputedStyle` ถ้าขาด) + `vite.config.ts` `test: { setupFiles: … }` — **ไม่ย้ายไป jsdom** (เพิ่ม dep ฟรี — polyfill เฉพาะจุดพอ)
- ConfigProvider/locale ไม่ต้อง wrap ใน test (component ทำงานโดยไม่มี context — theme default)

## ทดสอบด้วยมือ (browser) — checklist ก่อนปิดงาน

เนื่องจาก desktop browser ของเครื่องนี้ไม่ได้ต่อ (user paste console เอง) — checklist ให้ user ทำที่ dev server (`http://localhost:5173/`):

1. **ทุกหน้า x ทุก theme**: Dashboard, Create, Edit, Detail, Login, Register, 404 — สลับ ☀️/🌙 แล้วสี antd + CSS ตามกันทั้งหน้า (ไม่มีจุดสว่างค้างในโหมดมืด)
2. **Dashboard**: search กรอง live, filter สถานะ (รวม clear → ทั้งหมด), stats 4 ใบ, card กดได้ทั้งใบ + keyboard (Tab+Enter), ลบจาก card มี confirm
3. **Create**: validation ข้อความไทยใต้ field (ว่าง/เกิน 100/งบติดลบ), เพิ่ม/ลบ item, **upload รูป (drag&drop + คลิก) ≤5MB, เกิน → error ไทย** ← ยังค้างทดสอบจากงาน ImgBB
4. **Edit**: โหลดค่าเดิมครบ, เปลี่ยนรูป (objectUrl ไม่ถูกเขียนลง Firestore), ล้างรูป → รูปหายจริง, notFound state
5. **Detail**: ปุ่มกลับ/แก้ไข/ลบ, confirm ลบ, ลิงก์ร้านค้าเปิดใหม่ + `javascript:` (paste ใน item link) ไม่ถูกสร้างเป็น `<a>`
6. **Auth**: login/register validation, error ภาษาไทย (รหัสผ่านผิด = ยืนยันจากข้อความ map), redirect `from`
7. **Toast**: action ที่ปล่อย toast (ลบสำเร็จ/ล้มเหลว, logout fail) → notification โผล่ขวาบน + ปิดอัตโนมัติตามเวลา type
8. **Responsive**: ≤768px มี bottom nav ไม่มี sidebar, ≥768px กลับกัน, form ไม่ล้น
9. **A11y spot-check**: focus มองเห็น (focus-visible), Modal trap focus + Esc ปิด, menu aria

## Bundle size

- baseline ก่อน redesign: **857,855 bytes** (total)
- หลัง install antd + icons + font → วัด `npm run build` แล้วบันทึกตัวเลขใน `memory.md`
- **ยังไม่บล็อก** ที่ >500kB (M8/T51 รับผิดชอบ budget นี้อยู่แล้ว — งานนี้แค่บันทึกตัวเลข ไม่ต้อง optimize ก่อน M8)

## หลัง implement เสร็จ
1. รันทุก gate → แนบผลในรายงาน
2. User ทำ browser checklist → แก้ตาม feedback
3. **ขอ code review** (protocol มาตรฐานของ repo นี้) ก่อนถือว่าปิดงาน
4. อัปเดต `docs/memory.md` + tick ใน `docs/TASKS.md` (ถ้ามี task ของงาน redesign — ถ้าไม่มี บันทึกเป็นหน่วยงานเสริม)
