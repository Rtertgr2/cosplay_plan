# แผนปิดงานที่เหลือ — COSPLAN (2026-09-30)

**สั่ง:** "จัดการให้ครบเลย" · **สเปคอ้างอิง:** `specs/2026-09-30-cosplan-product-redesign-design.md` §6.1 (Landing) §7 (ฟอร์ม 5 ขั้น) + `docs/TASKS.md` M8 (T41–T52)
**สถานะตอนเริ่ม:** tests 139/139 · build ✓ · lint ✓ · rules 18/18 · branch `migration/react-firebase` (push แล้ว) · ยังไม่ deploy

## เฟส

| เฟส | ขอบเขต | สถานะ |
|---|---|---|
| **V4** | `PublicLayout` + Landing (`/`) + ย้าย workspace ไป `/dashboard` + อัปเดต nav/link ทั้งแอป | ✅ |
| **V5** | ฟอร์มสร้าง/แก้โปรเจกต์ 5 ขั้น (ตามสเปค §7) | ✅ |
| **V6** | Skeleton แทน `Loading...` ทุกหน้า | ✅ |
| **V7** | a11y + polish (T47–T49) | ✅ (a11y) · ตรวจตา/contrast รอผู้ใช้ |
| **M8** | T41 hosting ✅ · T42 build+ลด bundle ✅ · **T43 deploy — รออนุมัติ** · T50–T52 เอกสาร ✅ · T44–T49 ทดสอบมือ ⬜ | ⬜ |

## กติกา

- ทุกเฟส: TDD (เห็น RED ก่อนโค้ด) → gates (`npm test` · `npm run build` · `npm run lint` · `node scripts/rules-smoke-test.mjs`) → อัปเดต ledger นี้
- **ห้ามแตะ:** `firestore.rules` (18/18 ต้องผ่านตลอด) · `utils/{image,errors}.ts` · assertion ใน `shopLinkRender.test.tsx` / `NotFound.test.tsx`
- `firebase deploy` = กระทบ production → **ถามก่อนเสมอ** (ยังไม่อนุมัติ)
- โค้ดอยู่ในสาขาเดิม ไม่ commit/push เองจนกว่าจะสั่ง

## งานในแต่ละเฟส

### V4 — Landing
1. `PublicLayout` (COSPLAN | Features · How it works · Showcase | เข้าสู่ระบบ · เริ่มใช้งาน) + anchor scroll
2. `pages/Landing.tsx` — Hero (mockup UI จาก token, ไม่มี asset รูป) · Features 4 การ์ด · How it works 3 ขั้น · Showcase 3 ใบ (static) · CTA · Footer
3. Route migration: `/` → Landing (สาธารณะ) · `/dashboard` → Dashboard (ต้อง login) · `NAV_ITEMS` + ลิงก์ทั้งแอป (logo, ปุ่มหลัง login/register, "ดูทั้งหมด")
4. ผู้ login แล้ว → CTA เป็น "ไปที่ Dashboard"

### V6 — Skeleton
`Skeleton` แทน `PageState status="loading"` — การ์ด (Dashboard/Projects) · ฟอร์ม · รายละเอียด + เพิ่ม test ว่าไม่มีคำว่า "กำลังโหลด" เปล่าๆ

### M8
- T41: `firebase.json` hosting rewrites (ตรวจว่ามีอยู่แล้วหรือยัง)
- T42: production build + **ลด bundle** (1.64MB → code-split เส้นทางด้วย `React.lazy`)
- T43: `firebase deploy` — **ถามผู้ใช้ก่อน**
- T44–T49: checklist ทดสอบมือ (ผู้ใช้ทำส่วนตา/การใช้งาน, ผมรันส่วนอัตโนมัติ)
- T50: README · T51: `docs/firebase-setup.md` (ยังไม่มี) · T52: `docs/architecture.md` (ต้องอัปเดตส่วน React/Firebase)

## บันทึกการตัดสินใจ

(เติมระหว่างทำ)

## ผลลัพธ์

### V4 — Landing (เสร็จ)
- `components/layout/PublicLayout.tsx` (ใหม่) — COSPLAN + anchor (Features · How it works · Showcase) + เข้าสู่ระบบ · เริ่มใช้งาน + Drawer บนมือถือ · `styles/landing.css` (ใหม่)
- `pages/Landing.tsx` (ใหม่, 6 เคสเทสต์) — Hero + **mockup UI ทำจาก token ไม่มี asset รูป** (เทสต์ assert ว่าไม่มี `<img>`) · Features 4 · How it works 3 · Showcase 3 (static) · CTA · Footer
- Route: `/` → Landing (PublicLayout, สาธารณะ) · `/dashboard` → Dashboard (ProtectedRoute) · `NAV_ITEMS` เปลี่ยนเป็น `/dashboard`
- ลิงก์ที่ต้องแก้ตาม: logo ใน Header (ไป `/dashboard` เมื่อ login แล้ว) · `Login` (`from` เริ่มต้น) · `Register` (`navigate` หลังสมัคร) · `ProjectDetail` (หลังลบ → `/projects` ไม่ใช่หน้า Landing)
- **คง `NotFound` ไว้ที่ `href="/"`** เพราะ `NotFound.test.tsx` (ห้ามแก้) assert ไว้
- Gates: tests 145/145 · build ✓ · lint ✓

### V6 — Skeleton (เสร็จ)
- `components/common/PageSkeleton.tsx` (ใหม่) — variant `cards | detail | form | auth` แทน `PageState status="loading"` (spinner + ข้อความ "กำลังโหลด...")
- เปลี่ยน 5 จุด: Dashboard · Projects (cards) · ProjectDetail (detail) · EditProject (form) · ProtectedRoute (auth)
- **เคสที่ assertion ผ่านผิดเหตุ:** ใช้ `aria-busy="true"` แรก ๆ แต่ antd `Spin` มี attribute นี้อยู่แล้ว → ผ่านทั้งที่ยังไม่ได้แก้ · เปลี่ยนเป็น `data-testid="page-skeleton"` (marker ที่มีเฉพาะ skeleton) แล้ว RED ตอนนี้ได้จริง
- Gates: tests 148/148 · build ✓ · lint ✓

### V5 — ฟอร์ม 5 ขั้น (เสร็จ)
- `components/project/ProjectForm.tsx` → 5 ขั้นตามสเปค §7 (① ข้อมูลพื้นฐาน+หมายเหตุ ② รูปภาพ ③ งบ+สถานะ ④ รายการวัสดุ ⑤ ตรวจสอบ)
  - `Form` เดียวทั้งฟอร์ม → ค่าไม่หายเมื่อสลับขั้น · `Form.useWatch` ให้ขั้น ⑤ สรุปค่าสด
  - `validateFields` เฉพาะฟิลด์ของขั้นนั้น (ไม่ให้ error ข้ามขั้นรบกวน) · ขั้นสุดท้ายยังใช้ `validateProject()` มาตรฐานเดิม
  - Create/Edit ใช้ชุดเดียวกัน ไม่ต้องแก้หน้าเพจ
- `components/project/ProjectFormReview.tsx` (ใหม่) — สรุป + progress/spent + ปุ่ม "แก้ไข" ย้อนกลับทุกหัวข้อ
- เทสต์ (ใหม่ 6 เคส): ขั้น ⑤ สรุปถูก (67% / ฿3,200) · มีปุ่มแก้ไข · 5 ขั้นตามลำดับ · ขั้นแรกไม่มีส่วนอื่นล่วง
- **หมายเหตุ:** `aria-current="step"` ไม่มีใน markup ของ antd Steps (ใช้ class `ant-steps-item-process`) → ปรับ assertion ตามของจริง
- Gates: tests 154/154 (27 ไฟล์) · build ✓ · lint ✓

### M8 — T41/T42 + เอกสาร (เสร็จ)
- **T41**: `firebase.json` มี SPA rewrite `**` → `/index.html` อยู่แล้ว · **เพิ่ม section `storage`** (ก่อนหน้านี้ไม่มี → `firebase deploy` จะไม่อัปโหลด `storage.rules`)
- **T42**: code-split ด้วย `React.lazy` + `Suspense` (fallback = `PageSkeleton`) → entry bundle **1,663 KB → 232 KB** (gzip 515 KB → **73 KB**); หน้าที่โหลดครั้งแรกไม่ต้องดาวน์โหลดโค้ดของหน้าอื่น
- **T50/T51/T52**: `docs/firebase-setup.md` (ใหม่ — ตั้งค่า/Authorized domains/deploy/แก้ปัญหา) · README (stack, คำสั่ง, โครงสร้าง, สถานะ) · `architecture.md` (ตาราง routing 3 layout + code-split)
- Gates: build ✓ · lint ✓ · tests 154/154 · rules-smoke 18/18
- **ค้าง:** T43 `firebase deploy` (รอผู้ใช้อนุมัติ — กระทบ production) · T44–T49 ทดสอบมือ · V7 a11y/polish

### V7 — a11y (T48) เสร็จส่วนที่แก้ด้วยโค้ด
- **สิ่งที่ตรวจแล้วว่า OK อยู่แล้ว:** ProjectCard กดด้วย Enter/Space (`preventDefault` กันหน้าเลื่อน) + `role="button"` + `tabIndex=0` + `aria-label` · `AppLayout` ใช้ `Layout.Content` ของ antd = `<main>` (landmark) · `<img>` ทุกตัวมี `alt` · ปุ่มไอคอนเปล่ามี `aria-label` ครบ · `:focus-visible` มี outline · `prefers-reduced-motion` ปิด animation
- **ที่เพิ่ม:** ลิงก์ "ข้ามไปเนื้อหา" (`skip-link` → `#main-content` ใน `AppLayout`) — คีย์บอร์ดไม่ต้อง Tab ผ่านแถบบน+เมนูข้างทุกหน้า · ซ่อนด้วยการย้ายออกจอ (ไม่ใช่ `display:none`) เพื่อให้ focus ได้
- เทสต์ใหม่ `layout/AppLayout.test.tsx` (2 เคส)
- Gates: tests **156/156 (28 ไฟล์)** · build ✓ · lint ✓
- **ยังต้องตรวจด้วยตา/เครื่องมือ (ผมทำแทนไม่ได้):** contrast ของ `--muted`/`--meta` บนพื้นมืด-สว่าง (ต้อง ≥ 4.5:1), focus order ตอนเปิดเมนูมือถือ, screen reader อ่านภาษาไทย

### แก้ antd v6 deprecation (ผู้ใช้เจอใน console)
- `Space direction` → `orientation` (2 ที่: `PageSkeleton`, `ProjectFormReview`) + `Card bordered={false}` → `variant="borderless"` (`Projects.tsx`)
- **เทสต์ใหม่ที่แม่นกว่าการ assert markup:** ดัก `console.error` แล้วยืนยันว่าไม่มีข้อความ `[antd: ...] deprecated` — กันได้ทุก deprecation ในไฟล์ ไม่ใช่ prop เดียว
- **พิสูจน์ว่าเทสต์จับได้จริง:** ย้อนกลับไปใช้ `direction` ชั่วคราว → เทสต์ fail พร้อมข้อความเดียวกับที่ผู้ใช้เห็น (`Warning: [antd: Space] direction is deprecated`) แล้วคืนค่า
- **บทเรียน:** assert บน markup ใช้ไม่ได้กับ prop ที่ antd "กิน" ไปแล้วแปลงเป็น class (`orientation` ไม่โผล่ใน DOM) — ให้ดัก console แทน
- Gates: tests **157/157 (28 ไฟล์)** · build ✓ · lint ✓ · rules-smoke 18/18
