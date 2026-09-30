# 00 — Overview: Ant Design Redesign (Approach 1: Full antd idiomatic)

> วันที่: 2026-09-30 · สถานะ: รอ user review ทีละไฟล์ · **ห้าม implement / `pnpm add` เพิ่มก่อน spec ชุดนี้ถูก approve**
> เอกสารชุดนี้**ไม่ commit** (ตามข้อตกลง — ทุกอย่างค้างบน branch `migration/react-firebase`)

## เป้าหมาย

เปลี่ยน UI ทั้งหมดของ Cosplay Planner ไปใช้ **Ant Design v6** แบบ idiomatic (Approach 1 ที่เลือกไว้):
ทุก component เชิงโต้ตอบเป็น antd, ธีม/โทนสีมาจาก design system ที่ผสมกัน `dashboard`(B) + `creative`(C),
**โครง logic (hooks / services / validation / Firestore) ไม่แตะ** — แทนที่เฉพาะ "เปลือก UI"

ขอบเขต = **A: แทนทั้งหมด** — components 26 ไฟล์ + pages 7 ไฟล์

## การตัดสินใจที่ยืนยันแล้ว (จากบทสนทนา)

| เรื่อง | ตัดสินใจ |
|---|---|
| Approach | **1 — full antd idiomatic**: `ConfigProvider` ตัวเดียว map โทน → antd theme, antd Form/rules, antd Layout/Menu shell, Toast API เดิมคงไว้แต่ backs ด้วย antd notification |
| Design baseline | design system ของ repo `open-design/` — ผสม **B = `dashboard/`** (structure/status/density) + **C = `creative/`** (warmth/accent) |
| ขอบเขต | **A** — แทนทุก component เชิงโต้ตอบ + ทุกหน้า |
| Dark mode | คงไว้ — `useTheme` + `data-theme` เดิม, antd `darkAlgorithm` สลับตาม state เดียวกัน |
| Routes / business logic | ไม่แตะ react-router v8, hooks, services, `validation.ts`, `errors.ts`, `image.ts`, Firestore rules |
| การจัดเก็บเอกสาร | spec **แยกไฟล์ตามหน้า** (folder นี้) — review/สั่งแก้ทีละไฟล์ |
| ไม่ commit / ไม่ deploy | คงเดิม ทุกอย่าง uncommitted |

## Dependencies

| แพ็กเกจ | เวอร์ชัน | สถานะ |
|---|---|---|
| `antd` | `^6.6.5` | **ติดตั้งอยู่แล้ว** (อยู่ใน package.json + node_modules — ถ้าเพิ่มเองก็ใช้ได้เลย ไม่ต้องสั่งซ้ำ) |
| `@ant-design/icons` | `^6.3.4` | ยังไม่มี → `pnpm add` ตอน implement |
| `@fontsource-variable/inter` | ล่าสุด | ยังไม่มี → `pnpm add` ตอน implement (`index.html` ปัจจุบัน**ไม่ได้โหลด font จริง** — Inter เป็นแค่ชื่อ fallback ได้ system font) |

หมายเหตุ antd v6 (ยืนยันจาก migration guide แล้ว): React ≥18 (ผ่านกับ React 19.2), **ใช้ CSS variables by default** (สลับธีมเบา),
v5-compatible API, static methods (`message.xxx` / `Modal.confirm` / `notification.xxx`) **ไม่เห็น ConfigProvider context → ห้ามใช้ ให้ใช้ `App.useApp()` เท่านั้น**

ไอคอนที่จะใช้ (from `@ant-design/icons`): `HomeOutlined`, `PlusCircleOutlined`, `EditOutlined`, `DeleteOutlined`, `ArrowLeftOutlined`, `SearchOutlined`, `SunOutlined`, `MoonOutlined`, `UploadOutlined`, `LinkOutlined`, `WalletOutlined`, `LogoutOutlined`

## Theme architecture (หัวใจของการ "ปรับง่าย")

```tsx
// src/theme/antdTheme.ts (ใหม่) — ค่า B+C อยู่ที่นี่ที่เดียว
export function createAntdTheme(mode: 'light' | 'dark'): ThemeConfig
```

```tsx
// src/App.tsx — provider chain (สำคัญ: ลำดับนี้)
<ThemeContextProvider>                      {/* state mode + data-theme attr (ใหม่) */}
  <ConfigProvider locale={thTH} theme={createAntdTheme(mode)}>
    <AntdApp>                               {/* import { App as AntdApp } from 'antd' — กันชน src/App.tsx */}
      <AuthProvider>
        <ToastProvider>                      {/* ใช้ AntdApp.useApp() → notification */}
          <BrowserRouter><Layout>…routes…</Layout></BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </AntdApp>
  </ConfigProvider>
</ThemeContextProvider>
```

- **locale `thTH`** (`antd/locale/th_TH`) — Empty/DatePicker/etc เป็นไทยอัตโนมัติ
- **ปรับธีม = แก้ `src/theme/antdTheme.ts` ไฟล์เดียว** (ค่า token) + `src/styles/tokens.css` (CSS ที่ antd ไม่ครอบ)

### Token mapping — ค่าผสม B+C (แสง)

| antd token | ค่า | แหล่งที่มา |
|---|---|---|
| `colorPrimary` | `#ff6b00` | C: accent ส้ม |
| `colorInfo` | `#0ea5e9` | B: meta ฟ้า |
| `colorSuccess` | `#10b981` | B: status เขียว |
| `colorWarning` | `#f59e0b` | B: status เหลืองอำพัน |
| `colorError` | `#ef4444` | B: danger |
| `colorBgLayout` (page) | `#fff8d7` | C: canvas อุ่น |
| `colorBgContainer` (surface) | `#ffffff` | B=C |
| ข้อความ (seed) | `#1d1836` | C: fg น้ำเงินม่วงเข้ม |
| `borderRadius` / `LG` / `XL` / `SM` | `10` / `16` / `20` / `6` | กลาง ๆ B(8/12/18) / C(10/16/24) |
| `fontSize` | `15` | B: text-base |
| `fontFamily` | `'Inter Variable', Inter, system-ui, sans-serif` | B=C + fontsource |
| container | `1280px` | B: `--container-max` |

### Token mapping — Dark (`mode === 'dark'` → `theme.darkAlgorithm`)

ใช้ค่าจาก `open-design` kit.dark (`--od-*`): page `#0f1115` · surface `#171a21` · text `#f8fafc` · muted `#a7adba` · border `#2a2f3a`
+ accent คง `#ff6b00` (seed เดิมทุกอย่าง — algorithm แปลง component สีเอง) + `--surface-warm` dark กำหนดเอง `#1f2430` (hover/selected)

### Status → Tag color map (ใช้ซ้ำที่ Dashboard card + Detail)

เก็บเป็น export เดียวใน `src/utils/constants.ts` (ตัวใหม่ — ไม่แตะ logic เดิม):

```ts
export const STATUS_TAG_COLOR = {
  planning: 'blue', active: 'processing', waiting: 'gold',
  completed: 'success', cancelled: 'error',
} as const  // ค่า = antd Tag preset color
```

## ชะตาไฟล์ CSS ปัจจุบัน

| ไฟล์ | หลัง redesign |
|---|---|
| `tokens.css` (98 ตัว ชื่อระบบเดิม `--color-*`) | **เขียนใหม่** เป็น schema open-design (`--bg`, `--surface`, `--fg`, `--accent`, `--space-*`, `--radius-*` …) ทั้ง light + `[data-theme='dark']` — **ค่าเดียวกับตารางข้างบน** |
| `components.css` (208 บรรทัด: .btn/.input/.card/.badge/.spinner/.empty-state/.error-message …) | **ลบทั้งไฟล์** — แทนด้วย antd ทุกจุด |
| `layout.css` | เหลือเฉพาะ: `.container*` (ความกว้างหน้า), responsive rules `.sidebar`/`.mobile-nav`, `.sr-only`, `.truncate` (ตัวที่ยังถูกเรียก) — utility classes ที่ antd แทน (.flex/.grid/.gap-*) ลบตามการ audit ตอน implement |
| `globals.css` | คงไว้ (reset, typography, focus-visible, reduced-motion, scrollbar, selection) — เปลี่ยนแค่ชื่อ var ที่อ้าง |

**ระวังจุดเดียว**: reset `button { border: none; background: none }` ใน globals.css — antd ใช้ class (`.ant-btn`) ซึ่ง specificity สูงกว่า element selector จึงชนะ แต่ต้อง verify ตอน implement ว่าปุ่ม antd ไม่เพี้ยน

## รายการไฟล์ที่จะแก้/สร้าง/ลบ

**ใหม่:**
- `src/theme/antdTheme.ts` — createAntdTheme(mode)
- `src/context/ThemeContext.tsx` — provider รวม state (ปัจจุบัน `useTheme` เป็น state แยกต่อ component — ConfigProvider ที่ root ต้องเห็น toggle จึงต้องยกเป็น context; **API `useTheme() → {theme, toggle}` คงเดิม** ให้ ThemeToggle ไม่ต้องแก้)
- `src/styles/tokens.css` เขียนใหม่
- `main.tsx` — เพิ่ม `import '@fontsource-variable/inter'`

**แก้:** App.tsx (provider chain), components ทั้ง 26, pages ทั้ง 7, `globals.css`, `layout.css`

**ลบ:**
- `src/components/common/Modal.tsx` (consumer เดียว = ConfirmDialog → antd Modal ทำ focus/Escape เอง)
- `src/components/common/Toast.tsx` (ToastContainer → antd notification วาดเอง)
- `src/styles/components.css`

## Invariants (ห้ามละเมิด — จาก plan rules เดิม)

1. UI **ไม่ bind Firestore ตรง** — หน้า → hooks → services เท่านั้น (คงเดิม)
2. ไม่มี Base64 ใน DB — ImgBB flow ใน `storageService.ts` + `useImageUpload` ไม่แตะ
3. `src/utils/image.ts` (validate ≤5MB + processImage ≤1200px) — **ไม่แตะ**
4. `validation.ts` / `errors.ts` / Firestore rules / hooks / services — ไม่แตะ logic (validation ยังเป็น validator ให้ antd Form เรียก)
5. ไม่ commit, ไม่ deploy, หยุดก่อน M8 / T41–T52
6. Submit orchestration ของ CreateProject/EditProject (submitLock, upload-ต่อ-หลัง-create, navigate) — **byte-identical** เปลี่ยนแค่ชั้น render error

## สารบัญไฟล์ในโฟลเดอร์นี้

| ไฟล์ | เนื้อหา |
|---|---|
| `00-overview.md` | ไฟล์นี้ — scope, theme, dependencies, invariants |
| `01-shell.md` | Layout / Header / Sidebar / MobileNav / ThemeToggle |
| `02-dashboard.md` | หน้าหลัก + DashboardHeader, StatsCards, SearchBar, StatusFilter, ProjectGrid, ProjectCard |
| `03-create-project.md` | หน้าสร้างโปรเจกต์ + ProjectForm, StatusSelect, ImageUploader, ItemForm, ItemList |
| `04-edit-project.md` | หน้าแก้ไข (delta จาก 03) + กรณี image พิเศษ |
| `05-project-detail.md` | หน้ารายละเอียด + ProjectHero, ProjectStatus, ProjectNote, ProjectItems |
| `06-auth.md` | Login + Register |
| `07-notfound.md` | NotFound (404) |
| `08-shared.md` | ConfirmDialog, ErrorMessage, Loading, Toast→notification |
| `09-testing.md` | gates, test ที่เปลี่ยน/ไม่เปลี่ยน, checklist ตรวจด้วยมือ, bundle |
