# Legacy Behavior Documentation

> บันทึกพฤติกรรมของระบบ Cosplay Planner เวอร์ชันเดิม (Vanilla HTML/JS + Google Apps Script + Google Sheets)
> จดก่อนเริ่ม migrate ตาม T01

---

## 1. Feature List (ครบตามที่ทดสอบได้จากโค้ด)

### Dashboard (หน้าหลัก)
- [x] **Project List** — แสดงโปรเจกต์ทั้งหมดในรูปแบบ card grid (2 columns desktop)
- [x] **Statistics Cards** — 4 การ์ด: โปรเจกต์ทั้งหมด, กำลังดำเนินการ, เสร็จสมบูรณ์, งบประมาณรวม
- [x] **Search** — ค้นหาแบบ real-time (debounce 300ms) ค้นใน charName, seriesName, note
- [x] **Status Filter** — dropdown กรองตาม 5 สถานะ: planning, active, waiting, completed, cancelled
- [x] **Empty State** — แสดงเมื่อไม่มีโปรเจกต์ / ผลค้นหาไม่เจอ
- [x] **Create Button** — "+ สร้างโปรเจกต์" เปิดหน้า form

### Project Detail
- [x] **Project Information** — ชื่อตัวละคร, ซีรีส์, งบประมาณ, สถานะ, บันทึกย่อ
- [x] **Image** — แสดงรูปภาพ (base64) พร้อม placeholder เมื่อไม่มี
- [x] **Items List** — รายการสินค้า: ชื่อ, ราคา, หมวดหมู่, ลิงก์ร้านค้า (เปิดใน tab ใหม่)
- [x] **Shop Links** — ปุ่ม "ไปที่ร้านค้า" สำหรับ item ที่มี shopLink
- [x] **Actions** — "แก้ไขโปรเจกต์" และ "ลบโปรเจกต์" (มี confirm dialog)

### Project Form (Create / Edit ใช้ view เดียวกัน)
- [x] **Character Name** — required, ใช้เป็นชื่อโปรเจกต์ใน form title
- [x] **Series Name** — optional
- [x] **Budget** — required, number ≥ 0
- [x] **Status** — required, dropdown 5 ค่า (default: planning)
- [x] **Note** — optional, textarea
- [x] **Image Upload** — drag & drop / click เลือกไฟล์, preview, จำกัด 10MB (app.js) / 20MB (image.js)
- [x] **Items Management** — เพิ่ม/ลบรายการได้หลายรายการ แต่ละรายการมี: name (required), price (required, ≥0), shopLink (url), category (dropdown 4 ค่า)
- [x] **Save** — บันทึกแล้วกลับ dashboard หลัง 500ms

### Theme
- [x] **Light/Dark Mode** — toggle button ใน header, persist ใน localStorage (`cosplay-theme`), auto-detect `prefers-color-scheme`

---

## 2. Data Fields (จากโค้ดจริง)

### Project Object
| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | string | yes | `proj_${Date.now()}_${random}` | UUID จาก GAS หรือสร้าง client-side |
| `charName` | string | yes | — | ชื่อตัวละคร |
| `seriesName` | string | no | `''` | ชื่อซีรีส์ |
| `budget` | number | yes | `0` | บาท |
| `status` | enum string | yes | `'planning'` | planning/active/waiting/completed/cancelled |
| `note` | string | no | `''` | บันทึกย่อ |
| `base64Image` | string | no | `''` | **Base64 data URL** (เก็บใน Sheets) |
| `items` | array<Item> | no | `[]` | รายการสินค้า |
| `createdAt` | ISO string | yes | `new Date().toISOString()` | |
| `updatedAt` | ISO string | yes | `new Date().toISOString()` | อัปเดตทุกครั้งที่ save |

### Item Object
| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `name` | string | yes | — | ชื่อสินค้า |
| `price` | number | yes | `0` | บาท, ≥ 0 |
| `shopLink` | string | no | `''` | URL ร้านค้า |
| `category` | string | no | `''` | วิก/ชุด/พร็อพ/รองเท้า |

### Google Sheets Columns (จาก gas/Code.gs)
```
ProjectID | Character | Series | Budget | Status | Note | Items_JSON | Base64_Image | CreatedAt | UpdatedAt
```

---

## 3. Behavior Details (พฤติกรรมที่ต้อง Preserve)

### Data Flow & Sync Strategy
1. **Local-first** — `State` โหลดจาก `localStorage` (`cosplayProjects`) ทันทีตอน init
2. **Background sync** — `App.getProjects()` เรียก `API.list()` ไป GAS, merge ผ่าน `updatedAt` (remote win ถ้าใหม่กว่า)
3. **Optimistic UI** — save สำเร็จ → `State.add/update` ทันที → UI refresh จาก localState
4. **Fallback** — API fail → ใช้ local data แสดงผลต่อ (console.warn เท่านั้น)

### Image Handling
- **Input**: file input (accept image/*) + hidden URL input (ไม่ได้ใช้ใน UI ปัจจุบัน)
- **Processing** (app.js:213-261):
  - ตรวจ size ≤ 10MB (แตกต่างจาก image.js ที่ 20MB)
  - `FileReader.readAsDataURL` → `Image` → `canvas` resize max 1200px → `toDataURL('image/jpeg', 0.7)`
  - เก็บ base64 string ใน `State.tempBase64Image`
- **Storage**: base64 string เก็บตรงใน project object → sync ไป Google Sheets (คอลัมน์ `Base64_Image`)
- **Display**: `<img src="${base64}">` โดยตรง
- **Edit**: โหลด base64 เดิมมาแสดง preview, เปลี่ยนรูปใหม่ได้

### Search & Filter Logic (ui.js:88-105)
```javascript
// Search: case-insensitive, OR across 3 fields
(p.charName || '').toLowerCase().includes(query) ||
(p.seriesName || '').toLowerCase().includes(query) ||
(p.note || '').toLowerCase().includes(query)

// Filter: exact match status
p.status === statusFilter

// Combined: AND (search result THEN filter)
```

### Status Values & Labels
| Value | Label (TH) | Badge Class |
|-------|------------|-------------|
| `planning` | 📋 วางแผนอยู่ | `badge planning` |
| `active` | 🔨 กำลังดำเนินการ | `badge active` |
| `waiting` | ⏳ กำลังรอของ | `badge waiting` |
| `completed` | ✅ คอสเสร็จแล้ว | `badge completed` |
| `cancelled` | ❌ ยกเลิก | `badge cancelled` |

### Theme System (ui.js:9-37)
- Key: `cosplay-theme` ใน localStorage
- Default: `prefers-color-scheme: dark` → dark, ไม่ใช่ → light
- Attribute: `document.documentElement.setAttribute('data-theme', 'light'|'dark')`
- Icon: 🌙 (light) / ☀️ (dark)

### Navigation / View Switching (ui.js:39-56)
- 3 views: `viewDashboard`, `viewCreate`, `viewDetail` (hidden attribute)
- `UI.switchView()` — toggle hidden, trigger `App.loadDashboard()` เมื่อกลับ dashboard
- ไม่ใช้ router — SPA แบบ manual view switching

### Form Behavior
- **Create**: `State.currentEditId = null`, clear form, `State.tempItems = []`, `State.tempBase64Image = null`
- **Edit**: `State.currentEditId = projectId`, `API.get(id)` → `populateForm()` → switch to create view
- **Save**: 
  - validate `charName` required
  - สร้าง projectData รวม base64Image จาก `State.tempBase64Image` (หรือเก่า)
  - `API.create/update` → success → `State.add/update` → clear form → back to dashboard
- **Items**: dynamic DOM manipulation (`document.createElement`), เก็บใน `State.tempItems` ไม่ได้ใช้ (อ่านจาก DOM ตอน save)

### Delete Flow
- `confirm("ลบโปรเจกต์นี้?")` → `API.delete(id)` → `State.delete(id)` → toast → switch to dashboard

### Error Handling
- `UI.showLoading(true, message)` / `false` — overlay 全屏
- `UI.showToast(message, type)` — toast ขวามือล่าง, auto-dismiss 3s, 4 types: success/error/warning/info
- API errors → toast error, console.error
- ไม่มี centralized error mapping — แสดง `error.message` ตรงๆ

---

## 4. Known Limitations (จุดอ่อนของระบบเดิม)

| Issue | Impact | Migration Fix |
|-------|--------|---------------|
| **Base64 in Sheets** | รูปใหญ่ทำให้ sheet ช้า, quota หมดเร็ว, query ช้า | Firebase Storage + `imageUrl` |
| **No Auth** | ใครรู้ URL เข้าถึง/แก้/ลบได้หมด | Firebase Auth + Security Rules (ownerId) |
| **GAS Timeout** | 30s limit, payload ใหญ่ล้มเหลว | Firestore write ตรง |
| **CORS/Preflight** | GAS ต้องหลีกเลี่ยง Content-Type header | Firebase SDK จัดการเอง |
| **LocalStorage only** | ข้อมูลผูก device/browser, ไม่ sync ระหว่างเครื่อง | Firestore real-time / per-user |
| **No concurrent edit protection** | Race condition ตอน edit พร้อมกัน | Firestore transaction /乐观锁 |
| **Single user** | ไร้แนวคิด user/account | Multi-user with Auth |
| **No offline support** | network down = ใช้ไม่ได้ | Firestore offline persistence (ภายหลัง) |
| **Hardcoded GAS URL** | deploy ใหม่ต้องแก้โค้ด | Environment variables |
| **Search client-side only** | โหลดทั้งหมดมากรอง | Firestore query + client fallback |
| **No validation library** | validation กระจายใน app.js | `src/utils/validation.js` shared |
| **No test** | regression risk | Manual test checklist (T44) + future unit test |

---

## 5. GAS API Contract (for reference)

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
| `delete` | `{id}` or `id` string | `{success: true}` |

### Error Response
```json
{ "success": false, "error": "error message" }
```

---

## 6. Files to Archive (Reference Only)

| File | Role | Replaced By |
|------|------|-------------|
| `index.html` | Page shell + all views | React components + `index.html` (minimal) |
| `src/js/app.js` | App lifecycle, dashboard, form, detail logic | `src/pages/*` + `src/hooks/useProjects.js` |
| `src/js/api.js` | GAS HTTP client | `src/services/projectService.js` + `storageService.js` |
| `src/js/state.js` | localStorage + temp state | React state + `useProjects` + `useTheme` |
| `src/js/ui.js` | DOM rendering, toast, theme | React components |
| `src/js/image.js` | Client image processing → base64 | `src/utils/image.js` (returns Blob/File) |
| `src/style.css` | All styling | `src/styles/*` (design tokens + component styles) |
| `gas/Code.gs` | CRUD + search + Sheets | Firestore + Storage + Security Rules |

---

## 7. Acceptance Criteria for Migration (จากแผน)

- [ ] Feature parity: ทุกฟีเจอร์ในส่วนที่ 1 ทำงานได้บน React + Firebase
- [ ] Data fields: field ทั้งหมดในส่วนที่ 2 map เข้า Firestore schema ครบ
- [ ] Behavior: พฤติกรรมในส่วนที่ 3 คงเดิม (เว้นแต่ที่ออกแบบใหม่ เช่น auth, image storage)
- [ ] Limitations: จุดอ่อนในส่วนที่ 4 ได้รับการแก้ไขใน architecture ใหม่
- [ ] ไม่แก้ behavior เดิมโดยไม่จำเป็น (ตามหลัก migration principle #1)

---

*Document created: 2026-09-29*
*Source: Code review of legacy codebase (index.html, src/js/*, gas/Code.gs)*