# COSPLAN — Product Redesign (แผนหลักของ user + การตัดสินใจร่วม)

**วันที่:** 2026-09-30 · **สถานะ:** อนุมัติแล้ว (ผู้ใช้ตอบ "ok ไม่มีปัญหา" ต่อส่วน A/B/C)
**เอกสารต้นทาง:** `Cosplay_plan/docs/Cosplan_UI_Redesign_Plan.md` (แผนของผู้ใช้ 24 หัวข้อ)
**สเปคก่อนหน้า:** `docs/superpowers/specs/2026-09-30-antd-redesign/` (antd เต็มรูปแบบ — เสร็จแล้ว)
**สเปคก่อนหน้า:** `docs/superpowers/specs/2026-09-30-structure-overhaul-design.md` (โครงสร้างเฟส 1 — เสร็จแล้ว)

> Path = **Architectural** · แนวทาง = **Vertical slice** (ผู้ใช้เลือก) · ข้อบังคับเดิมที่ยกเว้น: อนุญาตให้แตะ `services/*`, `firestore.rules`, `validation.ts` (เพื่อเพิ่มฟิลด์ใหม่)

---

## 1. เป้าหมาย

เปลี่ยนจาก "Admin/CRUD dashboard" เป็น **product ที่เอาไป demo/ใส่ portfolio ได้** — ผู้ที่เห็นต้องเข้าใจภายใน 5–10 วินาที

## 2. สิ่งที่ตัดสินร่วมกัน (สรุปคำตอบผู้ใช้)

| # | การตัดสินใจ | คำตอบ |
|---|---|---|
| D1 | แตะข้อมูล/ข้อมูลใหม่ | ✅ อนุญาตเต็มที่ (services + rules + validation) |
| D2 | Brand | ✅ เปลี่ยนเป็น **ม่วง `#7C3AED` + ชื่อ COSPLAN** |
| D3 | Dark mode | ✅ **dark เป็นธีมหลัก (default มืด) + light เลือกได้** |
| D4 | Progress / spent | ✅ **คำนวณจากรายการสินค้า** (เพิ่ม `done`) |
| D5 | Share | ✅ **คัดลอกลิงก์ธรรมดา** (ไม่แตะ rules) |
| D6 | ลำดับทำ | ✅ **Vertical slice** (แอปก่อน → Landing → ฟอร์ม) |
| D7 | ปุ่มไปร้านใน Detail | ✅ เพิ่มปุ่มเปิดร้านต่อรายการ (ใช้ `shopLink` เดิม) |
| D8 | Hero ของ Landing | ✅ ใช้ **mockup UI** ทำด้วย token เราเอง (ไม่มี asset รูป) |
| D9 | Showcase | ✅ ข้อมูลตัวอย่าง 3 ใบ (ไม่ดึงข้อมูลจริง) |
| D10 | หน้า Settings/Profile | ❌ **ไม่ทำ** (YAGNI — ไม่มีข้อมูล/หน้าให้ทำ) |

## 3. สิ่งที่ทำเสร็จแล้ว (จาก 2 รอบก่อน — ไม่ต้องทำซ้ำ)

Design system/token · Navigation เดิม · Login/Register (เกือบครบ) · Empty state · Error state (`PageState`) · Responsive ส่วนใหญ่ · Accessibility · `PageContainer`/`ErrorBoundary`/`NAV_ITEMS`/layout routes · UI polish จาก `Cosplay_plan_UI_fixed.zip` (`.ui-section`, `.auth-*`, `.project-card`, การ์ดค้นหา)

## 4. Foundation

### 4.1 Brand tokens

| token | เดิม | ใหม่ (light) | ใหม่ (dark) |
|---|---|---|---|
| `--accent` | `#ff6b00` | `#7C3AED` | `#7C3AED` |
| `--accent-hover/active` | mix black 8/14% | เหมือนเดิม | เหมือนเดิม |
| `--accent-on` | `#fff` | `#fff` | `#fff` |
| `--bg` | `#fff8d7` | `#FAFAFC` | `#0B0B0F` |
| `--surface` | `#fff` | `#fff` | `#17171B` |
| `--surface-warm` | `#ffef9f` | `#F5F3FF` | `#1F1B2E` |
| `--fg` | `#1d1836` | `#18181B` | `#FAFAFA` |
| `--fg-2` | `#4c426c` | `#3F3F46` | `#D4D4D8` |
| `--muted` | `#796f91` | `#71717A` | `#A1A1AA` |
| `--border` | `#eadfba` | `#E4E4E7` | `#2E2E33` |
| `--border-soft` | `#f5eccd` | `#F4F4F5` | `#232328` |
| `--success/--warn/--danger` | `#10b981/#f59e0b/#ef4444` | `#16A34A/#D97706/#DC2626` | เหมือน light |
| `--meta` | `#0ea5e9` | `#0EA5E9` | `#0EA5E9` |

- **Typography**: base 16 (เดิม 15) · Display/H1 48 · H2 32 · H3 24 · H4 20 · Body 16 · Small 14 · Caption 12–13
- **Radius**: 8 / 12 / 16 / 24 + pill (แผน) — เดิม 10/16/20
- **Elevation**: Card `0 2px 8px` · Elevated `0 8px 24px` (เขียนเป็น `--elev-flat/ring/raised`)
- **Theme เริ่มต้น = dark**: `getInitialTheme()` = ค่าใน `localStorage` ถ้ามี มิฉะนั้น `'dark'` (ตัดการอ่าน `prefers-color-scheme` ออก)
- `antdTheme.ts` เปลี่ยนตามชุดใหม่ + `colorPrimary: '#7C3AED'`
- UI polish ใน zip ใช้ `var(--token)` ทั้งหมด → เปลี่ยนสีแล้วขยับอัตโนมัติ (raw hex ใน component = 0 ยืนยันแล้ว)

### 4.2 Data model (สิ่งใหม่ 2 อย่าง)

```ts
interface ProjectItem {
  name: string; price: number; shopLink: string; category: string
  done?: boolean     // ใหม่: ซื้อ/ทำเสร็จแล้ว
}
// progress = items.filter(i => i.done).length / items.length      (0 ถ้าไม่มีรายการ)
// spent    = ผลรวม price ของรายการที่ done
// budget   = project.budget (เดิม)
```

- เอกสารเก่าไม่มี `done` → ถือเป็น `false` (ไม่ต้อง migration)
- **`done` ไม่ต้องแก้ `firestore.rules`** — rules ปัจจุบันตรวจแค่ `d.items is list` (ไม่ได้ไล่ field ย่อยของ item) → เพิ่มได้เลยโดยไม่กระทบเงื่อนไขเดิม
- **Register เพิ่ม field "ชื่อ"** → เขียน `users/{uid}.displayName`
  - ไฟล์ใหม่ `src/services/profileService.ts` (`setDisplayName(uid, name)`, `getDisplayName(uid)`) — ปัจจุบัน auth ไม่มี service แยก (AuthContext เรียก Firebase ตรง)
  - **`firestore.rules` แก้จุดเดียว**: เพิ่ม `match /users/{userId}` → read/create/update เฉพาะ `request.auth.uid == userId` + validate `displayName is string && size() <= 50`
  - header แสดง `displayName` แทน email (fallback = email)
- **toggle วัสดุใน Detail ใช้ทางเดิม**: `updateProject` รับ `Partial<CreateProjectInput>` ซึ่งรวม `items` อยู่แล้ว → ส่ง `items` ทั้งชุด (ไม่ต้องเพิ่ม service path)
- **ไม่เพิ่ม**: activity log, share token, estimatedCost, progress field ระดับโปรเจกต์

### 4.2.1 กฎการแสดงตัวเลข (ตัดสินเพื่อไม่ให้กำกวม)

| เคส | การแสดงผล |
|---|---|
| ไม่มีรายการสินค้า | progress 0% · spent `฿0` / budget · ไม่ซ่อนแถบ (คงความสม่ำเสมอของการ์ด) |
| `spent ≤ budget` | progress = spent/budget · สี accent |
| `spent > budget` | progress 100% + ป้าย `เกินงบ ฿X` สี danger (ไม่ปล่อยให้แถบล้นเกิน 100%) |
| `budget = 0` | progress 0% (กันหาร 0) · แสดง `฿spent / ฿0` |

### 4.3 Routing

```text
/                    → Landing (สาธารณะ)              ← ใหม่
/dashboard           → Workspace (ต้อง login)          ← เดิมคือ /
/projects            → My Projects (ต้อง login)        ← ใหม่
/projects/new        → Create (ฟอร์ม 5 ขั้น)
/projects/:id        → Detail
/projects/:id/edit   → Edit (ฟอร์ม 5 ขั้น)
/login · /register   → AuthLayout
*                    → NotFound (อยู่ใต้ AppLayout เหมือนเดิม)
```

- Layout 3 ชั้น: `PublicLayout` (ใหม่) · `AuthLayout` (มีแล้ว) · `AppLayout` (มีแล้ว)
- `NAV_ITEMS` (จุดเดียว) → หน้าหลัก `/dashboard` · โปรเจกต์ของฉัน `/projects` · สร้างใหม่ `/projects/new`
- ย้าย `/` เป็น Landing **พร้อมกับตอนสร้าง Landing** (ไม่ย้ายล่วงหน้า เพื่อไม่ให้ช่องว่างตอนยังไม่มี Landing)
- Redirect: ผู้ login แล้วที่กด "เริ่มใช้งาน" → `/dashboard`

## 5. สไลซ์แอป (Vertical slice)

### 5.1 Dashboard = personal workspace

```
Good evening, <displayName|email> 👋
วางแผนคอสเพลย์ตัวต่อไป
[ + สร้างโปรเจกต์ ]
──────────────
[StatCards ×4: ทั้งหมด/กำลังทำ/เสร็จแล้ว/งบรวม]
──────────────
โปรเจกต์ของคุณ                          ดูทั้งหมด →   (6 ล่าสุด)
[ProjectCard × 6]
──────────────
กิจกรรมล่าสุด  (จาก updatedAt ของโปรเจกต์ — ไม่เพิ่มข้อมูล)
• อัปเดต "เรม" 2 ชั่วโมงที่แล้ว
```

- Greeting ตามเวลา (เช้า/บ่าย/เย็น) + ชื่อผู้ใช้
- **Dashboard = ภาพรวม (ไม่มีช่องค้นหา)** — ย้ายการ์ด "ค้นหาโปรเจกต์" (SearchBar + StatusFilter) จาก Dashboard ไปไว้ที่ `/projects` แทน เพื่อไม่ให้ตัวค้นหาซ้ำสองหน้า (เหตุผล: แผนของผู้ใช้วาง Dashboard เป็น "Your Projects → View all →" จริง)
- Skeleton ขณะโหลด (ดู 8)

### 5.2 ProjectCard = portfolio item

```
┌──────────────────────────┐
│   รูป cover (16:10)    ⋮  │  ⋮ = เมนู แก้ไข / ลบ
├──────────────────────────┤
│ ชื่อตัวละคร               │
│ ซีรีส์ · หมวดหมู่          │
│ [Tag สถานะ]               │
│ ความคืบหน้า ███████░░ 72% │  ← ใหม่ (Progress)
│ ฿1,250 / ฿5,000           │  ← ใหม่ (spent / budget)
│ อัปเดต 2 วันที่แล้ว         │
└──────────────────────────┘
```

- ย้ายปุ่มแก้ไข/ลบจากใต้การ์ด → เมนู `⋮` (Dropdown) — คลิกเมนูต้องไม่นำไป detail (stopPropagation เดิม + `onKeyDown` กัน Enter)
- คลิกการ์ด → `/projects/:id`; a11y เดิม (role=button, tabIndex, Enter) คงไว้ + `aria-label` เมนู
- 0 รายการ → แสดง Progress 0% / `฿0 / ฿งบ` (ไม่ซ่อน เพื่อความสม่ำเสมอ)

### 5.3 ProjectDetail = หน้า showcase

```
← กลับ (Link /projects)
┌──────────────────────────────────┐
│        HERO (ใหญ่ + คลิกซูม)     │
└──────────────────────────────────┘
ชื่อตัวละคร (H1 48) · ซีรีส์ · [Tag สถานะ]
[แก้ไข] [คัดลอกลิงก์] [ลบ]
──────────────────────────────
ความคืบหน้า   72%  ███████░░
งบประมาณ  ฿1,250 / ฿5,000  ███░░░░░
──────────────────────────────
วัสดุ / รายการสินค้า
  ✓ วิก        ฿1,200   [ไปที่ร้านค้า ↗]   ← toggle ได้ (เขียน Firestore)
  ○ รองเท้า     ฿1,800   [ไปที่ร้านค้า ↗]
  ○ สำหรับ      (ยังไม่มีลิงก์)             ← ไม่มีลิงก์ = ข้อความ muted
──────────────────────────────
บันทึกย่อ
สร้างเมื่อ … · อัปเดตเมื่อ …
```

- ติ๊กวัสดุ → `update` ส่ง `items` ทั้งชุด (แอปผู้ใช้คนเดียว; ยอมรับข้อจำกัด concurrent edit)
- ปุ่มร้าน: `isValidUrl` guard คงเดิม · `target="_blank" rel="noopener noreferrer"` · `aria-label="ไปที่ร้านค้า: {ชื่อสินค้า} (เปิดแท็บใหม่)"`
- Share = copy ลิงก์ `/projects/:id` ผ่าน `navigator.clipboard.writeText` → toast "คัดลอกลิงก์แล้ว" · ถ้า clipboard ใช้ไม่ได้ (เบราว์เซอร์/บริบท) → toast error + แสดงลิงก์ให้ก๊อปเอง
- คอลัมน์เนื้อหาจำกัด `--container-form` (เดิมจากสเปคโครงสร้าง)

### 5.4 หน้า /projects (My Projects)

```
[การ์ด "ค้นหาโปรเจกต์" = SearchBar + StatusFilter]   ← ย้ายมาจาก Dashboard (zip)
[+ สร้างโปรเจกต์]
โปรเจกต์ทั้งหมด (เรียง updatedAt desc)  ·  จำนวนที่แสดง
[ProjectCard …]
```

- reuse `SearchBar`/`StatusFilter`/`ProjectGrid` เดิม (ไม่เขียนใหม่) · ปุ่ม "ดูทั้งหมด →" บน Dashboard ลิงก์มาที่นี่

## 6. หน้าสาธารณะ

### 6.1 Landing (`/`)

```
PublicLayout: COSPLAN | Features · How it works · Showcase | เข้าสู่ระบบ · [เริ่มใช้งาน]
Hero        : "Plan your cosplay. / Create your character. / Make it real."
              + คำอธิบายไทย + [เริ่มวางแผน] [ดูตัวอย่าง] + mockup UI (static, token เราเอง)
Features    : 4 การ์ด — จัดการโปรเจกต์ · ติดตามงบ · รายการวัสดุ+ลิงก์ร้าน · ธีมสว่าง/มืด
How it works: 3 ขั้น — สร้างโปรเจกต์ → เติมรายการวัสดุ → ติดตามความคืบหน้า
Showcase    : ตัวอย่าง 3 ใบ (static) + [ดูตัวอย่างผลงาน] → /login
CTA         : ยังไม่มีบัญชี? [สร้างบัญชีฟรี]
Footer      : COSPLAN · เครดิตเล็ก ๆ
```

- anchor ในหน้าเดียว (`#features` `#how-it-works` `#showcase`) — ไม่แตกหน้า
- Hero mockup = โครงจริง (header + การ์ด + progress) ย่อขนาด ใช้ token/คลาสเดียวกับแอป — ไม่มี asset รูป
- ผู้ login แล้ว → CTA เป็น "ไปที่ Dashboard"

## 7. ฟอร์ม 5 ขั้น (Create + Edit ชุดเดียวกัน)

```
① ข้อมูลพื้นฐาน  charName* · seriesName · note
② รูปภาพ        ImageUploader (drag/คลิก) + เปลี่ยน/ลบ
③ งบประมาณ+สถานะ budget(฿) · status
④ รายการวัสดุ     เพิ่มรายการ (ชื่อ/ราคา/ลิงก์ร้าน/หมวด) + ติ๊ก "ซื้อแล้ว"
⑤ ตรวจสอบ        สรุปทุกอย่าง + กลับไปแก้ได้ + [สร้างโปรเจกต์ / บันทึกการแก้ไข]
```

- แถบ `Steps` + ปุ่ม [ย้อนกลับ] [ต่อไป →] · validate ตอนกด "ต่อไป" เรียก `validateProject` เดิม
- Enter ในช่องขั้นถัดไปห้าม submit ฟอร์ม (คง guard เดิมของ ItemForm)
- Edit = prefill ค่าเดิม + รูปเดิม + [ยกเลิก] → กลับ detail
- **สัญญา `onSubmit` เดิมต้องคงทุก field** → `CreateProject`/`EditProject` ไม่ต้องแก้ logic
- ยัง 1 หน้า แต่แบ่งขั้น (ไม่ใช่หลาย URL) — เพื่อให้ `navigate` กลับ detail ได้เหมือนเดิม

## 8. สถานะ + งานเก็บ

| งาน | รายละเอียด |
|---|---|
| **Skeleton** | แทน Spin ใน Dashboard/Detail/Projects — สูงเท่าเนื้อหาจริง (กัน UI กระโดด), ใช้ token `--elev-flat`/`--border-soft` |
| Empty state | ทุกจุดมี CTA (เช่น "ยังไม่มีโปรเจกต์ → [สร้างโปรเจกต์]") |
| Error state | ใช้ `PageState` เดิม + ไม่โชว์ Firebase error ตรง ๆ (`errors.ts` แปลงไทยแล้ว) + `console.error` |
| Micro-interaction | card hover `translateY(-2px)` + เงา, รูป `scale(1.02)`, Progress animate, button transition — ผ่าน `--motion-*` + `prefers-reduced-motion` (มีอยู่แล้ว) |
| A11y | contrast หลังเปลี่ยนม่วง (ทั้ง 2 โหมด), keyboard ทุก interactive ใหม่, `aria-label` เมนู/ปุ่มร้าน |

## 9. เทสต์

**ใหม่**
- `utils/projectProgress.ts` (pure: `progressOf(items)`, `spentOf(items)`, `budgetLabel(items, budget)`) + unit test ครบ edge case (ไม่มีรายการ / ไม่มี `done` / ซื้อหมด / spent>budget / budget=0)
- `ProjectCard` แสดง Progress + spent/budget + เมนู `⋮`
- Detail: toggle วัสดุ → เรียก `update` ด้วย `items` ถูกชุด · ปุ่มร้านมี `target="_blank" rel="noopener noreferrer"` + `aria-label` · ไม่มีลิงก์ → ข้อความ muted · เกินงบ → ป้าย danger
- Landing + PublicLayout render มี anchor ครบ/CTA ถูกปลายทาง
- `profileService` เขียน/อ่าน `displayName` (mock Firestore) + Register ส่งค่าเข้า service
- **rules-smoke +2 เคส**: `users/{userId}.displayName` เขียน/อ่านเฉพาะเจ้าของ · โปรเจกต์ที่มี `items[].done` เขียนได้ (ยืนยันว่า rules เดิมรองรับ)

**ห้ามแก้ (ต้องผ่านเหมือนเดิม)**: `shopLinkRender.test.tsx`, `NotFound.test.tsx`
**ทุกงานจบด้วย**: `npm run build` + `lint` + `test` + `node scripts/rules-smoke-test.mjs` (แตะ path อัปโหลด → รัน `imgbb-smoke-test.mjs`)

## 10. ลำดับทำ (Vertical slice)

```text
V1 Foundation   : brand tokens + theme เริ่มต้นมืด + typography/radius/elevation ใหม่
V2 Data model   : item.done (type+UI) + profileService + rules match /users/{userId} + rules-smoke 2 เคส + unit test
V3 Slice หลัก   : Dashboard workspace → ProjectCard(progress/spent/⋮) → Detail(showcase + ปุ่มร้าน) → /projects
V4 Public       : PublicLayout + Landing + nav/route migration
V5 Forms        : ฟอร์ม 5 ขั้น (Create + Edit)
V6 States       : Skeleton + empty/error ขัดกับงานใหม่
V7 Polish       : micro-interaction + a11y re-check + Final QA ตาม checklist แผน
```

## 11. นอกขอบเขต (YAGNI)

หน้า Settings/Profile · activity log · share token/ลิงก์สาธารณะ · โปรเจกต์สาธารณะ · ชื่อฟิลด์แยกตามแผน (เช่น "Materials" = `items` เดิม) · แยกหน้า How-it-works · แปลภาษา UI · dark/light แบบสลับอัตโนมัติตาม OS

## 12. ความเสี่ยง + การรับมือ

| ความเสี่ยง | รับมือ |
|---|---|
| ข้อมูลเก่าไม่มี `done` | ถือเป็น `false` + พิสูจน์ด้วย rules-smoke |
| แก้ `firestore.rules` แล้วของเขียนไม่ได้ | แก้เฉพาะ `match /users/{userId}` (เพิ่มใหม่) — `items[].done` ไม่ต้องแก้ rules · รัน rules-smoke เดิม 18 เคสต้องยังผ่าน + เคสใหม่ 2 เคส |
| UI polish ใน zip ใช้สีครีม/ส้มค้าง | ตรวจด้วยตาทุกหน้า + ปรับเฉพาะจุดที่ค่าคงที่ (ไม่มี raw hex ใน component) |
| ฟอร์ม 5 ขั้นรื้น `ProjectForm` ที่ใช้ร่วม Create/Edit | คงสัญญา `onSubmit` เดิมทุก field + tests เดิมต้องผ่าน |
| Landing ไม่มีภาพจริง | mockup UI จาก token (D8) |
| "กิจกรรมล่าสุด" ไม่บอก action จริง | ยอมรับว่าเป็น "อัปเดตล่าสุด" จาก `updatedAt` (D: ไม่เพิ่มข้อมูล) |
| งานเดิมยังไม่ commit | ทุกงานต้องมี gate ผ่าน + ผู้ใช้ตรวจในเบราว์เซอร์ก่อนขึ้นงานถัดไป |

## 13. ข้อบังคับคงเดิม (จากผู้ใช้)

- **ไม่ commit** · หยุดก่อน M8 / T41–T52 · ไม่ deploy โดยไม่ถาม
- ไม่แตะ `src/utils/image.ts`, `src/utils/errors.ts` (ยกเว้น: `services/*`, `firestore.rules`, `validation.ts` อนุญาตแล้ว)
- antd static methods ห้าม (ใช้ `App.useApp()`) · UI ห้ามผูก Firestore ตรง · ห้าม Base64 ใน DB
- `shopLinkRender.test.tsx` / `NotFound.test.tsx` ห้ามแก้
- งานยังอยู่บน branch `migration/react-firebase` ไม่มี commit ใหม่
