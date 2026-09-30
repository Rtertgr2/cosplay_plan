# Legacy Behavior — Cosplay Planner (ก่อน Migrate)

> เอกสารนี้บันทึกพฤติกรรมของระบบเดิม (Vanilla JS + GAS + Google Sheets)
> อ่านก่อนเริ่ม migration — ใช้เป็น baseline เทียบว่า "ของใหม่เท่าเดิมไหม"
>
> **บันทึกจากการอ่าน source code** (commit `bfec9e0`, 28 ก.ย. 2026)
> ยังไม่ได้รันจริงบน browser — ส่วนที่ระบุว่า "⚠️ ต้องยืนยัน" ต้องทดสอบเพิ่ม

---

## 1. System Overview

```text
index.html (ทั้ง UI markup + inline onclick)
  ├── src/style.css
  ├── src/js/state.js   → window.State   (localStorage)
  ├── src/js/api.js     → window.API     (fetch ไป GAS)
  ├── src/js/ui.js      → window.UI      (DOM rendering)
  └── src/js/app.js     → window.App     (logic + event) → DOMContentLoaded → App.init()

gas/Code.gs → Google Sheets (sheet ชื่อ "Projects")
```

- **ไม่มี build step** — เปิด `index.html` ได้เลย (แต่ GAS ต้อง deploy ไว้ก่อน)
- **ไม่มี routing** — สลับหน้าด้วย `UI.switchView()` เปิด/ปิด attribute `hidden`
- **ไม่มี authentication** เลย — GAS deploy เป็น "Anyone"
- **ไม่มี module system** — ทุกอย่างเป็น global object ผูกกับ `window`

---

## 2. Data Model (จริง)

### Project

| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | string | frontend สร้างเป็น `"proj_" + Date.now()`; GAS ใช้ `Utilities.getUuid()` ถ้าไม่ได้ส่งมา |
| `charName` | string | **required** (validate ที่เดียวในระบบเดิม) |
| `seriesName` | string | optional (แต่ HTML มี `required` — จริง ๆ ไม่เปิด) |
| `budget` | number | `parseInt(...) \|\| 0` |
| `status` | string | `planning` \| `active` \| `waiting` \| `completed` \| `cancelled` |
| `note` | string | optional |
| `items` | array | JSON string ใน Sheets (`Items_JSON`) |
| `base64Image` | string | **data URL เต็ม** — เก็บในคอลัมน์ `Base64_Image` |
| `createdAt` | string | ISO 8601 (`new Date().toISOString()`) |
| `updatedAt` | string | ISO 8601 |

> ⚠️ **`hasImage`** — GAS `listProjects()` คืน field นี้ แต่ `getProjectById()` **ไม่คืน** → API ไม่สม่ำเสมอ

### Item

| Field | Type | หมายเหตุ |
|---|---|---|
| `name` | string | required (ถ้าว่าง item จะถูก **ทิ้งเงียบ ๆ** ไม่ถูก push) |
| `price` | number | `parseInt(...) \|\| 0` |
| `shopLink` | string | optional (input type=url แต่ไม่มี validation จริง) |
| `category` | string | **ค่าเป็นภาษาไทย** — `วิก` / `ชุด` / `พร็อพ` / `รองเท้า` |

> ⚠️ แผนตั้งใจใช้ `"wig"` — **ของจริงเป็น `"วิก"`** ต้องตัดสินใจตอน T09

### Google Sheets columns

```text
ProjectID | Character | Series | Budget | Status | Note | Items_JSON | Base64_Image | CreatedAt | UpdatedAt
```

---

## 3. Status & Labels (ค่าจริง)

| Value | Label ที่แสดง | Badge class |
|---|---|---|
| `planning` | 📋 วางแผนอยู่ | `.badge.planning` |
| `active` | 🔨 กำลังดำเนินการ | `.badge.active` |
| `waiting` | ⏳ กำลังรอของ | `.badge.waiting` |
| `completed` | ✅ คอสเสร็จแล้ว | `.badge.completed` |
| `cancelled` | ❌ ยกเลิก | `.badge.cancelled` |

> Label มี **emoji นำหน้า** และ `completed` = "คอสเสร็จแล้ว" (ไม่ใช่ "เสร็จแล้ว")
> ค่า default ถ้าไม่ได้ระบุ = `planning`

---

## 4. Behavior ที่ต้อง Preserve

### 4.1 Dashboard

- โหลดครั้งแรก: `App.init()` → `State.init()` → `loadDashboard()`
- แสดง **stat 4 ใบ**: total / active / completed / budgetTotal
  - `active` = นับ `status === 'active'` เท่านั้น
  - `completed` = นับ `status === 'completed'` เท่านั้น
  - `budgetTotal` = **ผลรวม budget ของทุกโปรเจกต์** (รวมที่ยกเลิกแล้วด้วย)
  - แสดงเป็น `฿` + `toLocaleString()`
- **Search** — ค้นข้าม 3 field: `charName`, `seriesName`, `note`
  - case-insensitive (`toLowerCase().includes()`)
  - **ทำที่ client** ใน `UI.renderProjects()` ไม่ใช่ server
- **Status filter** — dropdown มี "สถานะทั้งหมด" (ค่า `""`) + 5 สถานะ
- Search + filter ทำงาน **พร้อมกัน** (AND)
- **Project card** แสดง: thumbnail 80×80 (หรือ gradient 🎭), ชื่อตัวละคร, ซีรีส์, badge สถานะ, `📦 Items: N`, `💰 ฿budget`
  - คลิกที่ card → เปิด detail
  - มีปุ่ม ✏️ / 🗑️ ใน card (ซ่อนจน hover)
- **Empty state**: 🎭 + "ยังไม่มีโปรเจกต์" + ข้อความชวนกดสร้าง
  - ⚠️ เดียวกันทั้ง "ไม่มีข้อมูลเลย" และ "ค้นไม่เจอ" → ระบบใหม่ควรแยก

### 4.2 Create / Edit (view เดียวกัน)

- ใช้ **ฟอร์มเดียวกัน** ทั้ง create และ edit (`viewCreate`)
- โหมด edit ถูกคุมด้วย `State.currentEditId` (`null` = ใหม่)
- ลำดับ field ในฟอร์ม: **รูปภาพ → ชื่อตัวละคร + งบประมาณ → ชื่อซีรีส์ → สถานะ → บันทึกย่อ → รายการสินค้า → ปุ่มบันทึก**
- **Validation จริงมีแค่ข้อเดียว**: `charName` ว่าง → toast "กรุณากรอกชื่อตัวละคร"
  - ⚠️ attribute `required` ใน HTML **ไม่เคยทำงาน** เพราะ form ใช้ `onsubmit="return false"` และ save ผ่าน `onclick`
- หัวข้อฟอร์มเปลี่ยนตาม `charName` ที่พิมพ์ (create: "สร้างโปรเจกต์ใหม่" / edit: "แก้ไขโปรเจกต์: <ชื่อ>")
- หลัง save สำเร็จ: toast "บันทึกสำเร็จ! 🎉" → ล้างฟอร์ม → **รอ 500ms** แล้วกลับ dashboard
- Edit: populate ค่าเดิมทั้งหมดรวม items และรูป

### 4.3 Items

- เพิ่มด้วยปุ่ม "+ เพิ่มสินค้า" → **DOM ถูกสร้างสด ๆ** ด้วย `innerHTML`
- แต่ละ item เป็น `<form>` ย่อย (เก็บค่าตอน save ด้วย `FormData`)
- ปุ่ม "🗑️ ลบ" = `this.closest('.card').remove()` → **ลบจาก DOM ทันที ไม่ถามยืนยัน**
- Item ที่ `name` ว่างจะถูก**ข้ามเงียบ ๆ** ตอน save
- ไม่มีการคำนวณ "รวมราคาสินค้า" เทียบกับ budget

### 4.4 Image

**โค้ดที่ใช้งานจริง** = logic ที่ inline อยู่ใน `app.js:handleImageFile()` (ไม่ใช่ `image.js`)

```text
เลือกไฟล์
  → ตรวจ size > 10MB → ปฏิเสธ (toast error)
  → FileReader.readAsDataURL
  → <img> load
  → canvas: ย่อขนาดให้ด้านยาวสุด 1200px
  → canvas.toDataURL('image/jpeg', 0.7)
  → เก็บใน State.tempBase64Image
  → save ลง Sheets เป็น Base64
```

- ✅ ลากไฟล์มาวางได้ (drop zone `#uploadArea`) — แต่**ไม่มี event listener จริง** แค่ข้อความบอก ⚠️ ต้องยืนยัน/แก้
- Preview แสดงทันทีหลังเลือก
- Input `accept="image/*"`
- ⚠️ ข้อความบน UI เขียนว่า "สูงสุด 5MB" แต่ **โค้ดจริงตรวจ 10MB** → ไม่ตรงกัน

> **`src/js/image.js` เป็น dead code** — `window.ImageProcessor` ไม่เคยถูกเรียกที่ไหนเลย
> ค่าในนั้น (20MB, 800×800, quality 0.7) **ไม่มีผลกับระบบ**

### 4.5 Detail

- แสดง: ชื่อตัวละคร (h1), ซีรีส์, งบประมาก (`฿` + locale), รูป/placeholder, badge, บันทึกย่อ, รายการสินค้า
- ไม่มีรูป → แสดง "ยังไม่มีรูปภาพ"
- Item แต่ละอัน: ชื่อ + badge category + ราคา + ปุ่ม "ไปที่ร้านค้า" (`target="_blank"`)
  - ⚠️ **ไม่มี `rel="noopener noreferrer"`**
  - ไม่มี shopLink → "ยังไม่ได้ระบุลิงก์ร้านค้า"
- ปุ่ม: ← กลับ / ✏️ แก้ไข / 🗑️ ลบ
- ลบ: `confirm("ลบโปรเจกต์นี้?")` → API.delete → toast → กลับ dashboard

### 4.6 Theme

```text
localStorage key : "cosplay-theme"
attribute        : <html data-theme="light|dark">
default          : "light" (ตั้งใน HTML)
system detect    : prefers-color-scheme: dark → บันทึกลง localStorage ทันที
toggle button    : ☀️ (เมื่อเป็น dark) / 🌙 (เมื่อเป็น light)
```

### 4.7 Loading / Toast

- **Loading**: overlay เต็มจอ + spinner + ข้อความ (กำลังโหลดข้อมูล / กำลังบันทึก / กำลังลบ / กำลังประมวลผลรูป / กำลังเริ่มต้นแอป)
- **Toast**: มุมขวาบน, border-left สีตาม type, **หายเอง 3 วินาที**, slide-out 300ms
  - types: `success` / `error` / `warning` / `info`

### 4.8 Offline / Sync Behavior (สำคัญ)

ระบบเดิมเป็น **local-first hybrid**:

```text
1. อ่าน localStorage "cosplayProjects" → localProjects
2. ถ้า API configured → fetch จาก GAS
3. merge: เอา remote ถ้า remote.updatedAt > local.updatedAt
4. เขียนผลลัพธ์กลับ localStorage
5. ถ้า API พัง → ใช้ local data ต่อ (ไม่ crash)
```

→ ผู้ใช้เห็นข้อมูลแม้ออฟไลน์ แต่ข้อมูล "ค้าง" ใน browser
→ ระบบใหม่ (Firestore) จะ **ตรงข้ามกัน** (server เป็น single source of truth) — ต้องตัดสินใจว่าจะยอมเปลี่ยนพฤติกรรมนี้

---

## 5. Known Limitations (ของเดิม)

| # | ปัญหา | รายละเอียด |
|---|---|---|
| L1 | **ไม่มี auth** | GAS deploy เป็น "Anyone" — ใครก็อ่าน/เขียนข้อมูลได้ทั้งชีต |
| L2 | **Base64 ใน database** | รูป 1200px ~ 100–300KB → เป็น string ~150–400KB ต่อแถว → ช้าลงเรื่อย ๆ, quota เต็มง่าย |
| L3 | **localStorage เป็นแหล่งข้อมูลหลัก** | localStorage 5MB → base64 กินพื้นที่จนข้อมูลเสียหายง่าย |
| L4 | **Merge logic ใหม่ทุกครั้ง** | `App.getProjects()` ถูกเรียกทุก keystroke ของ search → fetch GAS ซ้ำ ๆ |
| L5 | **search ยิง 2 ครั้งต่อ keystroke** | มีทั้ง inline `oninput` ใน HTML **และ** `addEventListener` ใน `setupEventListeners()` |
| L6 | **validation แทบไม่มี** | ตรวจแค่ `charName`; `required` ใน HTML ใช้ไม่ได้ |
| L7 | **XSS risk** | render ด้วย `innerHTML` + interpolate ค่าจากผู้ใช้ (`charName`, `note`, `shopLink`) โดยไม่ escape |
| L8 | **URL ไม่ถูก validate** | `shopLink` ใส่ `javascript:...` ได้ → คลิกแล้วรัน script |
| L9 | **ปุ่มบน card มองไม่เห็นบนมือถือ** | `opacity: 0` จนกว่า hover → touch device แตะไม่ได้ |
| L10 | **ไม่มี routing** | refresh แล้วไม่มี deep link — เปิด detail ไม่ได้โดยตรง |
| L11 | **GAS timeout / quota** | Apps Script มี execution limit (6 นาที) + quota ต่อวัน |
| L12 | **GAS update ลบรูปไม่ได้** | `if (data.base64Image) setValue(...)` → ส่งค่าว่างมาแล้วรูปเดิมยังอยู่ |
| L13 | **`hasImage` ไม่สม่ำเสมอ** | list มี, get ไม่มี |
| L14 | **detail ใช้ `currentEditId` ผูกกัน** | ปุ่มแก้ไข/ลบอ่าน `window.State.currentEditId` — ถ้า state ไม่ตรงจะผิดโปรเจกต์ |
| L15 | **ไม่มี sort/filter เพิ่ม** | พึ่ง `updatedAt desc` จาก GAS เท่านั้น |
| L16 | **ไม่มี a11y** | `<div onclick>` แทน button, ไม่มี alt ที่มีความหมาย, ไม่มี focus management |
| L17 | **ไม่มี optimistic UI / retry** | ล้มเหลว = toast แล้วจบ |
| L18 | **drop zone ไม่ทำงาน** | UI บอก "ลากมาวาง" แต่ไม่มี dragover handler |
| L19 | **input ลิงก์รูปซ่อนไว้** | `#imageUrl` อยู่ใน `display:none` — feature ที่วางไว้แต่ไม่เคยใช้ |

---

## 6. สิ่งที่ต้องตัดสินใจตอน Migrate

| หัวข้อ | ของเดิม | ต้องเลือก |
|---|---|---|
| Category | `วิก`/`ชุด`/`พร็อพ`/`รองเท้า` (ไทย) | คงไทย หรือเปลี่ยนเป็น slug อังกฤษ + label แยก? |
| Status label | มี emoji นำหน้า | เก็บ emoji ไว้ หรือแยก emoji → UI layer? |
| Local-first | merge local + remote | Firestore = server เป็นหลัก (offline cache ให้ SDK จัดการเอง) |
| Validation | ตรวจแค่ charName | บังคับตามฟอร์มเดิม (charName, budget) หรือเข้มขึ้น (seriesName ด้วย)? |
| Image limit | โค้ด 10MB / ข้อความ 5MB | แผนกำหนด 5MB → ยึด 5MB |
| Image max dim | 1200px | ยึด 1200px (คงของเดิม) |
| Compression | JPEG 0.7 | คง 0.7 แต่**คืน Blob ไม่ใช่ base64** |
| Budget | ไม่แสดงสรุป item | เพิ่มการแสดง "รวมราคาสินค้า" หรือไม่? |
| Delete confirm | `confirm()` ของ browser | เปลี่ยนเป็น ConfirmDialog (UI-08) |
| Empty state | ไม่แยก "ไม่มีข้อมูล" กับ "ค้นไม่เจอ" | แยก 2 กรณี |

---

## 6b. GAS API Contract (อ้างอิงตอนแทนที่ด้วย Firestore)

### GET Actions
| Action | Params | Response |
|--------|--------|----------|
| `list` | — | `{success: true, data: Project[]}` |
| `get` | `id` | `{success: true, data: Project}` |
| `search` | `q` | `{success: true, data: Project[]}` |

### POST Actions
| Action | Data | Response |
|--------|------|----------|
| `create` | Project (no id) | `{success: true, id}` |
| `update` | Project + `id` | `{success: true, id}` |
| `delete` | `{id}` หรือ id string | `{success: true}` |

### Error Response
```json
{ "success": false, "error": "error message" }
```

> ⚠️ ทั้งหมดนี้ **หายไปทั้งชุด** เมื่อเปลี่ยนเป็น Firestore
> Firestore ใช้ promise throw/reject แทน envelope `{success, data, error}`

### สิ่งที่ต้อง archive (reference)

| ไฟล์ | หน้าที่ | แทนด้วย |
|------|--------|---------|
| `index.html` | Page shell + views ทั้งหมด | React components + `index.html` (minimal) |
| `src/js/app.js` | lifecycle, dashboard, form, detail | `src/pages/*` + `src/hooks/useProjects.js` |
| `src/js/api.js` | GAS HTTP client | `src/services/projectService.js` + `storageService.js` |
| `src/js/state.js` | localStorage + temp state | React state + `useProjects` + `useTheme` |
| `src/js/ui.js` | DOM rendering, toast, theme | React components |
| `src/js/image.js` | image processing → base64 (**dead code**) | `src/utils/image.js` (คืน Blob/File) |
| `src/style.css` | styling ทั้งหมด | `src/styles/*` |
| `gas/Code.gs` | CRUD + search + Sheets | Firestore + Storage + Security Rules |

---

## 7. Design Tokens เดิม (อ้างอิงตอนทำ UI-01)

`src/style.css` มี token พร้อมแล้ว ใช้เป็นฐานต่อได้:

```text
--primary #6366f1  --primary-hover #4f46e5  --primary-bg #eef2ff  --primary-light #818cf8
--success #10b981  --warning #f59e0b  --error #ef4444  --info #3b82f6
--bg-main / --bg-secondary / --surface / --surface-hover / --border / --border-light
--text-main / --text-muted / --text-light / --text-inverse
--shadow-sm … --shadow-2xl
--radius-sm … --radius-full
--transition-fast / --transition-base / --transition-slow
```

- Dark mode = override ชุดเดียวกันใต้ `[data-theme="dark"]`
- สไตล์: **Glassmorphism** (`backdrop-filter` + `rgba` surface)
- Font: **Inter** (latin) + **Noto Sans Thai** — โหลดจาก Google Fonts
- ⚠️ ยังมี inline style ใน HTML เยอะมาก → ระบบใหม่ต้องย้ายไป token/class (UI-01)

---

## 8. สิ่งที่ยังต้องยืนยัน (ต้องรันเว็บจริง)

- [ ] ลากไฟล์รูปมาวางที่ drop zone — ใช้งานได้จริงไหม
- [ ] ขนาดไฟล์ 6–10MB — ผ่านหรือถูกปฏิเสธ (ขัดกับข้อความ 5MB)
- [ ] ไฟล์ GIF — canvas แปลงเป็น JPEG → เฟรมแรกเท่านั้น?
- [ ] ไฟล์ PNG พื้นใส — กลายเป็นพื้นดำ/ขาว?
- [ ] search ทำงานถูกไหมเมื่อสลับระหว่าง API ใช้งาน/ใช้ไม่ได้
- [ ] GAS URL ใน `api.js` ยังใช้ได้อยู่ไหม (มัน hard-code ไว้)
- [ ] budget ในช่องว่าง → แสดง `฿0` หรือ error
- [ ] ลบ item แล้ว save — ถูกลบจริงไหม

---

## 9. สรุปสิ่งที่ "ต้องเหมือนเดิม" vs "ปล่อยให้ดีขึ้น"

**ต้องเหมือนเดิม (behavior ที่ผู้ใช้คุ้นเคย)**
- ชุด status 5 ค่า + ความหมาย
- โครงหน้า Dashboard → Form → Detail
- สถิติ 4 ใบ + สูตรคำนวณ
- search ข้าม charName/seriesName/note (case-insensitive)
- filter ตามสถานะ + ทำงานพร้อมกัน
- item 4 field + ปุ่มเพิ่ม/ลบ
- theme light/dark + persist
- ข้อความ toast หลัก ("บันทึกสำเร็จ! 🎉", "ลบสำเร็จ", "กรุณากรอกชื่อตัวละคร")

**ปล่อยให้ดีขึ้น (ตามแผน)**
- Base64 → Firebase Storage URL
- ไม่มี auth → Firebase Auth + ownerId
- localStorage เป็นหลัก → Firestore เป็นหลัก
- ไม่มี routing → React Router + deep link
- validation แค่ charName → validation ครบ
- innerHTML → React (แก้ XSS)
- confirm() → ConfirmDialog สวย
- overlay เต็มจอ → loading/empty/error เฉพาะจุด

---

## 10. Acceptance Criteria for Migration

- [ ] **Feature parity** — ทุกฟีเจอร์ในส่วน 4 ทำงานได้บน React + Firebase
- [ ] **Data fields** — field ทั้งหมดในส่วน 2 map เข้า Firestore schema ครบ (เพิ่ม `ownerId`, เปลี่ยน `base64Image` → `imageUrl`)
- [ ] **Behavior** — พฤติกรรมในส่วน 4 คงเดิม เว้นแต่ที่ออกแบบใหม่ (auth, image storage, routing)
- [ ] **Limitations** — จุดอ่อนในส่วน 5 (L1–L19) ได้รับการแก้ใน architecture ใหม่
- [ ] **ไม่แก้ behavior เดิมโดยไม่จำเป็น** (หลัก migration principle #1)
- [ ] ข้อในส่วน 8 (สิ่งที่ต้องยืนยัน) ถูกทดสอบจริงครบ

---

*อัปเดต 2026-09-29 — รวม GAS API contract + files to archive คืนจากเวอร์ชันก่อนหน้า*
