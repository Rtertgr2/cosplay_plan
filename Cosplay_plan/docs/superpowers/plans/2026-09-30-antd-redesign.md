# Ant Design Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยน UI ทั้งหมดของ Cosplay Planner ไปใช้ Ant Design v6 (full replacement) ด้วย design tokens ผสม `dashboard`(B) + `creative`(C) — โดยไม่แตะ logic ชั้น hooks/services/validation/Firestore

**Architecture:** `ConfigProvider` ตัวเดียว map โทนผ่าน `createAntdTheme(mode)` + `<AntdApp>` wrapper (antd v6 บังคับ static methods ผ่าน `App.useApp()`) · `ThemeContext` ใหม่เลี้ยงทั้ง antd algorithm และ `data-theme` attr · คงสัญญา props/API ของ component เดิมทุกตัวให้หน้าต่าง ๆ ไม่ต้องแก้ · CSS ชั้นในจะสลับเป็น schema ของ open-design หลัง component ถูก swap หมด (two-block transition)

**Tech Stack:** React 19 + Vite 8 + TS strict + react-router v8 + antd ^6.6.5 + @ant-design/icons ^6.3.4 + @fontsource-variable/inter + vitest 5 (node env, renderToStaticMarkup — **ไม่เพิ่ม jsdom**)

**Spec:** `docs/superpowers/specs/2026-09-30-antd-redesign/` (10 ไฟล์ — อ่านคู่กันทุก task)

## Global Constraints

1. **ห้าม commit ทุก task** — งานทั้งหมดค้าง uncommitted บน `migration/react-firebase` (ข้อตกลง user; ขัดกับ template มาตรฐานของ skill ข้อนี้ให้ยึดข้อ 1)
2. ห้าม `firebase deploy` / แตะ `firebase-tools` / global installs ใด ๆ · หยุดก่อน M8 / T41–T52
3. Dependencies: antd `^6.6.5` **มีใน package.json แล้ว (ห้ามติดตั้งซ้ำ)** · เพิ่มได้เฉพาะ `@ant-design/icons@^6.3.4` และ `@fontsource-variable/inter`
4. antd static methods (`message.*`, `Modal.confirm`, `notification.*` ระดับ module) **ห้ามใช้** — ผ่าน `<AntdApp>` / `App.useApp()` เท่านั้น
5. `src/utils/image.ts`, `utils/validation.ts`, `utils/errors.ts`, `hooks/*` (ยกเว้น useTheme refactor), `services/*`, Firestore rules — **ห้ามแตะ logic**; `utils/constants.ts` เพิ่มได้แค่ `STATUS_TAG_COLOR`
6. Props/API contracts คงเดิมเป๊ะ: `ProjectForm {initialData?, onSubmit(data), isSubmitting}` · `ImageUploader {imageUrl, onChange(file: File|null, previewUrl: string)}` · `ConfirmDialog {isOpen, title, message, confirmLabel?, cancelLabel?, isDestructive?, onConfirm, onCancel}` · `ErrorMessage {title?, message, onRetry?}` · `Loading {message?}` · `SearchBar {value, onChange(value: string)}` · `StatusFilter {value, onChange(value: string)}` · `useToast().addToast(type: ToastType, message: string)` · `ToastType = 'success'|'error'|'warning'|'info'`
7. Toast durations: success/info **3000ms**, warning **5000ms**, error **6000ms**
8. `STATUS_TAG_COLOR = { planning: 'blue', active: 'processing', waiting: 'gold', completed: 'success', cancelled: 'error' }`
9. Token values ยึดตาราง `00-overview.md` เป๊ะ: light — primary `#ff6b00`, info `#0ea5e9`, success `#10b981`, warning `#f59e0b`, error `#ef4444`, bg `#fff8d7`, surface `#ffffff`, fg `#1d1836`, border `#eadfba`; dark (kit.dark) — page `#0f1115`, surface `#171a21`, text `#f8fafc`, muted `#a7adba`, border `#2a2f3a`, surface-warm `#1f2430`, accent คง `#ff6b00`; radius `10/16/20`, fontSize `15`, container `1280`
10. ข้อความไทย validation/error ทุกเส้น **มาจากชุดเดิม** (`validation.ts` + `validateLogin/Register` + `ERROR_MESSAGES`) — ห้ามเขียนข้อความใหม่ซ้ำ
11. Test security assertions **ห้ามอ่อนข้อ**: `javascript:` link ห้ามสร้าง `<a` · https link ต้องมี `rel="noopener noreferrer"` · NotFound ต้องคง `404` + `ไม่พบหน้านี้` + `href="/"`
12. Gates รันหลังจบ **ทุก task**: `npm run build` && `npm run lint` && `npm test` (ชุดใหญ่มี smoke 2 ตัวรันเฉพาะ task สุดท้าย)

## Review Focus

สิ่งที่ spec บอกนัยแต่ test ไม่ได้ครอบ — แต่ละข้อถูกผูกกับ task ที่เป็นเจ้าของ:

1. **Dark mode ครึ่งจอ** (antd สลับ algorithm แต่ CSS vars ไม่สลับ หรือ reverse) → test `antdTheme.test.ts` (dark → darkAlgorithm + ค่า dark) + test `ThemeContext.test.tsx` (provider/hook wiring) ใน Task 1; การเห็น eye-ball ทั้งสองชั้น = checklist #1 ของ user (Task 13)
2. **Edit page เขียน objectUrl ลง Firestore / ล้างรูปไม่ล้าง** → Task 7 รักษาสัญญา `onChange(File|null, previewUrl)` เป๊ะ (tsc พิสูจน์), Task 8 มี step verify ว่า `EditProject.handleSubmit` ไม่ถูกแตะ, user checklist #4 (Task 13)
3. **shopLink XSS** (`javascript:` จากข้อมูล Firestore เก่า) → test `shopLinkRender.test.tsx` ที่ต้องผ่านหลัง swap (Task 7/9 — ปรับได้เฉพาะวิธี match markup)
4. **404 strings หาย** → test `NotFound.test.tsx` (Task 11)
5. **`addToast` 5 call sites พัง** (type/duration เพี้ยน) → tsc บังคับ signature (Task 4) + test `toast-context.test.ts` pin durations (Task 4)

---

## File Structure

| การ | Path | ความรับผิดชอบ |
|---|---|---|
| สร้าง | `src/theme/antdTheme.ts` | `createAntdTheme(mode)` — ค่าโทน B+C ทั้งหมดอยู่ที่นี่ที่เดียว |
| สร้าง | `src/theme/antdTheme.test.ts` | pin token/algorithm |
| สร้าง | `src/context/theme-context.ts` | type + `createContext` (ตาม pattern fast-refresh ของ repo: `*-context.ts` + `*Context.tsx`) |
| สร้าง | `src/context/ThemeContext.tsx` | provider: state + `data-theme` attr + localStorage |
| สร้าง | `src/context/ThemeContext.test.tsx` | pin default/toggle/throw |
| สร้าง | `src/context/toast-context.test.ts` | pin durations |
| แก้ | `src/hooks/useTheme.ts` | เปลี่ยนจาก local state → อ่าน ThemeContext (API `{theme, toggle}` เดิม) |
| แก้ | `src/App.tsx` | provider chain: ThemeContextProvider > ConfigProvider(locale thTH, theme) > AntdApp > AuthProvider > ToastProvider > BrowserRouter |
| แก้ | `src/main.tsx` | `+ import '@fontsource-variable/inter'` |
| แก้ | `src/styles/tokens.css` | Task 2 เพิ่ม block ใหม่ (schema open-design, light+dark) **คู่** block เดิม · Task 12 ลบ block เดิม |
| แก้ | `src/utils/constants.ts` | + `STATUS_TAG_COLOR` (Task 6) |
| แก้ | หน้าทั้ง 7 (`src/pages/*.tsx`) | render layer → antd (Tasks 8,9,10,11) |
| แก้ | components ทั้ง 21 ที่เหลือ (ยกเว้น ProtectedRoute) | internals → antd (Tasks 3,5,6,7,9) |
| ลบ | `src/components/common/Modal.tsx` | antd Modal แทน (Task 3) |
| ลบ | `src/components/common/Toast.tsx` | notification แทน (Task 4) |
| ลบ | `src/styles/components.css` | ถูกแทนหมดแล้ว (Task 12) |
| แก้ | `src/styles/globals.css`, `layout.css`, `index.css` | rename var → schema ใหม่ / ตัด utility ที่ตายแล้ว (Task 12) |
| แก้ | `src/context/toast-context.ts`, `ToastContext.tsx` | slim เป็น `{addToast}` + `TOAST_DISMISS_MS` export (Task 4) |
| แก้ | `src/components/project/shopLinkRender.test.tsx`, `src/pages/NotFound.test.tsx` | ปรับ match ให้ตรง markup ใหม่ **คง assertion ความหมาย** (Tasks 7,9,11) |

---

### Task 1: Theme foundation (deps + antdTheme + ThemeContext + provider chain)

**Files:**
- Create: `src/theme/antdTheme.ts`, `src/theme/antdTheme.test.ts`, `src/context/theme-context.ts`, `src/context/ThemeContext.tsx`, `src/context/ThemeContext.test.tsx`
- Modify: `src/hooks/useTheme.ts`, `src/App.tsx`, `src/main.tsx`, `package.json`

**Interfaces:**
- Produces: `createAntdTheme(mode: 'light'|'dark'): ThemeConfig` (Task 1 ทุก task ที่เหลือพึ่งผ่าน App.tsx) · `ThemeContextProvider({ children })` · `useTheme(): { theme: 'light'|'dark'; toggle(): void }` (throw ถ้าไร้ provider) · คง `STORAGE_KEY = 'cosplay-theme'` + `data-theme` attr

- [ ] **Step 1: ติดตั้ง dependencies**

```bash
export PATH="/home/teerametr/.local/share/pnpm/bin:$PATH"
pnpm add @ant-design/icons@^6.3.4 @fontsource-variable/inter
```
Expected: เพิ่ม 2 ตัว, `antd` ไม่ถูกแตะ, pnpm ไม่ค้าง build approval (allowBuilds ตั้งแล้ว)

- [ ] **Step 2: เขียน failing test `src/theme/antdTheme.test.ts`**

2 cases: (ก) light → `algorithm` คือ `theme.defaultAlgorithm` + token `colorPrimary #ff6b00`, `colorInfo #0ea5e9`, `colorSuccess #10b981`, `colorWarning #f59e0b`, `colorError #ef4444`, `colorBgLayout #fff8d7`, `colorBgContainer #ffffff`, `colorTextBase #1d1836`, `colorBorder #eadfba`, `borderRadius 10`, `fontSize 15`, `fontFamily` มี `'Inter Variable'` (ค่าจาก Global Constraints ข้อ 9) · (ข) dark → `algorithm` คือ `theme.darkAlgorithm` + `colorBgLayout #0f1115`, `colorBgContainer #171a21`, `colorTextBase #f8fafc`, `colorBorder #2a2f3a`, `colorPrimary #ff6b00` (accent คงทุกโหมด)

- [ ] **Step 3: รัน test — ต้อง FAIL**

Run: `npm test -- src/theme/antdTheme.test.ts`
Expected: FAIL "Cannot find module '../theme/antdTheme'" (หรือ `./antdTheme`)

- [ ] **Step 4: สร้าง `src/theme/antdTheme.ts`**

```ts
import { theme, type ThemeConfig } from 'antd'
export function createAntdTheme(mode: 'light' | 'dark'): ThemeConfig
```
ร่าง: คืน `{ algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm, token: {...} }` — token light ตาม Step 2; token dark = ค่า kit.dark ใน Global Constraints + คง color seed ทั้งหมด (algorithm แปลง component สีเอง)

- [ ] **Step 5: รัน test — ต้อง PASS** (`npm test -- src/theme/antdTheme.test.ts`)

- [ ] **Step 6: เขียน failing test `src/context/ThemeContext.test.tsx`**

2 cases (renderToStaticMarkup): (ก) ห่อ `<ThemeContextProvider>` + Probe ที่เรียก `useTheme()` → html มี `theme="light"` (node ไม่มี window → default light) และ `toggle=function` · (ข) `<Probe/>` โดด ๆ (ไร้ provider) → `toThrow('useTheme ต้องใช้ภายใต้')`

- [ ] **Step 7: รัน test — ต้อง FAIL** (`npm test -- src/context/ThemeContext.test.tsx`)

- [ ] **Step 8: สร้าง ThemeContext + refactor useTheme**

- `src/context/theme-context.ts`: `export type Theme = 'light'|'dark'` + `export const ThemeContext = createContext<{theme: Theme; toggle(): void} | null>(null)` (ไม่มี component export — กัน fast-refresh lint)
- `src/context/ThemeContext.tsx`: `ThemeContextProvider` — state `getInitialTheme()` (ย้าย logic จาก useTheme เดิม: localStorage `'cosplay-theme'` → matchMedia system) , `useEffect` → `document.documentElement.setAttribute('data-theme', theme)` + `localStorage.setItem`, `toggle` useCallback
- `src/hooks/useTheme.ts`: เหลือแค่ `useContext(ThemeContext)` + throw ถ้า null (คงชื่อไฟล์/export ให้ ThemeToggle ไม่ต้องแก้)

- [ ] **Step 9: รัน test ชุด — ทั้ง 2 ไฟล์ PASS** (`npm test`)

- [ ] **Step 10: ต่อ provider chain ใน `src/App.tsx` + font ใน `src/main.tsx`**

```tsx
// App.tsx — App() = <ThemeContextProvider><AppInner/></ThemeContextProvider>
// AppInner(): const { theme } = useTheme() แล้ว:
<ConfigProvider locale={thTH} theme={createAntdTheme(theme)}>
  <AntdApp>            {/* import { App as AntdApp } from 'antd'; import thTH from 'antd/locale/th_TH' */}
    <AuthProvider><ToastProvider><BrowserRouter><Layout>…Routes เดิมไม่แตะ…</Layout></BrowserRouter></ToastProvider></AuthProvider>
  </AntdApp>
</ConfigProvider>
```
`main.tsx`: เพิ่ม `import '@fontsource-variable/inter'` ก่อน import App — **คง ToastContainer ไว้ก่อน** (ลบใน Task 4)

- [ ] **Step 11: Gates**

Run: `npm run build && npm run lint && npm test`
Expected: ผ่านทั้งหมด (ชุด test = เดิม 27 + ใหม่ 4)

---

### Task 2: tokens.css — เพิ่ม block โทนใหม่คู่ของเดิม

**Files:**
- Modify: `src/styles/tokens.css`

**Interfaces:**
- Produces: CSS vars ชุดใหม่ (schema open-design) ให้ component ที่จะ swap ใน Tasks 3-11 เรียกได้ทันที — `--bg --surface --surface-warm --fg --fg-2 --muted --border --border-soft --accent --accent-on --success --warn --danger --purple --text-* --space-* --radius-* --leading-* --motion-* --container-max` + extension `--font-weight-medium/semibold/bold`

- [ ] **Step 1: เพิ่ม `:root` block ใหม่ (แทรกใต้ block เดิม) + `[data-theme='dark']` block ใหม่**

ค่า light = Global Constraints ข้อ 9 + scale จาก `open-design/design-systems/{dashboard,creative}/tokens.css`: text `11/13/15/17/22/30/42` (B) · space `4/8/12/16/20/24/32/48` (เท่ากันทั้งคู่) · radius `10/16/20` + `--radius-pill: 9999px` · `--leading-body 1.48 · --leading-tight 1.1` (B) · motion `120ms/200ms` (B — density) · `--container-max: 1280px` (B) · `--surface-warm #ffef9f` (C) · `--fg-2 #4c426c · --muted #796f91` (C) · `--purple: #8b5cf6` (extension — ค่าเดิมของโปรเจกต์ ใช้โดย ProjectHero gradient) · `--font-weight-medium 500 · --font-weight-semibold 600 · --font-weight-bold 700` (extension — globals.css ใช้อยู่)
ค่า dark = kit.dark ทั้งหมดในข้อ 9 + `--surface-warm #1f2430` + accent/success/warn/danger **คงค่า light** (kit.dark ไม่ได้ให้ status สี — ค่า light อ่านออกบนพื้นมืด)
**ห้ามลบ/แก้ block เดิม** (component เก่ายังเรียก `--color-*`)

- [ ] **Step 2: Verify**

Run: `npm run build && npm test && grep -c -- "--bg:" src/styles/tokens.css`
Expected: gates ผ่าน · grep ≥1 (ทั้งสอง block อยู่ร่วม, ชื่อไม่ชนกัน)

---

### Task 3: Shared — ConfirmDialog → Modal, Loading → Spin, ErrorMessage → Result

**Files:**
- Modify: `src/components/common/ConfirmDialog.tsx`, `Loading.tsx`, `ErrorMessage.tsx`
- Delete: `src/components/common/Modal.tsx`

**Interfaces:**
- Consumes: antd `Modal`, `Spin`, `Result`, `Button`, `Flex`, `Typography` (ผ่าน ConfigProvider ของ Task 1)
- Produces: contracts เดิมครบ (Global Constraints ข้อ 6) — หน้าที่ import ทั้ง 3 ตัว (ProjectCard, ProjectDetail, Dashboard, EditProject) ไม่ต้องแก้

- [ ] **Step 1: ConfirmDialog → antd Modal** — map `isOpen→open`, `title`, message ใน `<Typography.Paragraph type="secondary">`, `okText=confirmLabel`, `cancelText=cancelLabel`, `okButtonProps={{ danger: isDestructive }}`, `onOk/onCancel` — props interface ห้ามขยับ
- [ ] **Step 2: Loading → Spin** — `<Spin size="large" tip={message}>` ใน Flex center (คง `role="status"` ที่ wrapper ถ้า Spin ไม่ให้)
- [ ] **Step 3: ErrorMessage → Result** — `status="error"`, `title={title}`, `subTitle={message}`, `extra={onRetry && <Button type="primary" onClick={onRetry}>ลองใหม่</Button>}` — คง `role="alert"` ที่ wrapper
- [ ] **Step 4: ลบ `common/Modal.tsx` + กวาด import**

Run: `grep -rn "common/Modal\|from './Modal'" src --include="*.tsx" | grep -v "common/Modal.tsx"` → ต้องว่าง
- [ ] **Step 5: Gates** — `npm run build && npm run lint && npm test` (ต้องผ่านโดย test เดิมไม่แก้เลย)

---

### Task 4: Toast → antd notification

**Files:**
- Modify: `src/context/toast-context.ts`, `src/context/ToastContext.tsx`, `src/App.tsx`
- Create: `src/context/toast-context.test.ts`
- Delete: `src/components/common/Toast.tsx`

**Interfaces:**
- Consumes: `AntdApp.useApp().notification` (Task 1)
- Produces: `useToast(): { addToast(type: ToastType, message: string): void }` (คง) · `TOAST_DISMISS_MS: Record<ToastType, number>` export ใหม่จาก `toast-context.ts`

- [ ] **Step 1: เขียน failing test `src/context/toast-context.test.ts`** — assert `TOAST_DISMISS_MS` `toEqual({ success: 3000, info: 3000, warning: 5000, error: 6000 })`
- [ ] **Step 2: รัน — FAIL** (`npm test -- src/context/toast-context.test.ts`)
- [ ] **Step 3: ย้าย + slim** — ย้าย `AUTO_DISMISS_MS` → `toast-context.ts` เป็น `export const TOAST_DISMISS_MS` · `ToastContextValue` เหลือ `{ addToast }` ( verify: `grep -rn "toasts\b\|removeToast" src` ต้องพบแค่ใน 2 ไฟล์ context — consumer นอกไม่มีจริง) · `Toast` interface ลบถ้าไร้คนใช้
- [ ] **Step 4: ToastProvider → notification** — `ToastContext.tsx`: `const { notification } = AntdApp.useApp()`; ลบ state toasts/timers ทั้งหมด; `addToast` = `notification[type]({ message, duration: TOAST_DISMISS_MS[type], placement: 'topRight' })` (ใช้ switch ถ้า TS บ่นเรื่อง union index)
- [ ] **Step 5: รัน test — PASS**
- [ ] **Step 6: ลบ `common/Toast.tsx` + ลบ `<ToastContainer />`/import ใน App.tsx** — 5 call sites (Header, ProjectCard, ProjectDetail, CreateProject, EditProject) **ห้ามแก้**
- [ ] **Step 7: Gates** — `npm run build && npm run lint && npm test` (tsc คือตัวพิสูจน์ signature ของ addToast)

---

### Task 5: Shell — Layout / Header / Sidebar / MobileNav / ThemeToggle

**Files:**
- Modify: `src/components/layout/{Layout,Header,Sidebar,MobileNav,ThemeToggle}.tsx`

**Interfaces:**
- Consumes: antd `Menu`, `Button`, `Space`/`Flex`, `Typography`, icons (`HomeOutlined, PlusCircleOutlined, LogoutOutlined, SunOutlined, MoonOutlined`), `useTheme` (Task 1)
- Produces: class `sidebar` / `mobile-nav` คงอยู่บน element เดิม (responsive rules ของ globals.css พึ่งอยู่) · links `[{key:'/', …}, {key:'/projects/new', …}]`

- [ ] **Step 1: Sidebar → antd Menu** — `<Menu mode="vertical" items={…} selectedKeys={[location.pathname]} onClick={({key}) => navigate(key)}>` ข้างใน `<nav className="sidebar" aria-label="เมนูหลัก">` เดิม; ไอคอน emoji → `HomeOutlined`/`PlusCircleOutlined`
- [ ] **Step 2: MobileNav → antd Menu mode="horizontal"** ใน `<nav className="mobile-nav">` เดิม (items/selectedKeys เหมือนกัน)
- [ ] **Step 3: Header** — logo `Link + Typography.Text` สี primary, email → `Typography.Text ellipsis maxWidth 150`, ปุ่ม logout → `<Button icon={<LogoutOutlined/>}>` — `logout()/addToast` logic ห้ามแตะ
- [ ] **Step 4: ThemeToggle → `<Button icon={theme==='dark' ? <SunOutlined/> : <MoonOutlined/>} aria-label=…>`** — `useTheme()` ห้ามแตะ
- [ ] **Step 5: Layout → antd `<Layout>` + `<Layout.Content>`** คง arrangement flex column + `paddingBottom` เดิม
- [ ] **Step 6: Verify classes + Gates**

Run: `grep -n 'className="sidebar"' src/components/layout/Sidebar.tsx && grep -n 'className="mobile-nav"' src/components/layout/MobileNav.tsx && npm run build && npm run lint && npm test`
Expected: เจอทั้ง 2 class · gates ผ่าน (responsive + eye-ball → user checklist #8)

---

### Task 6: Dashboard ทั้งหน้า

**Files:**
- Modify: `src/utils/constants.ts` (+`STATUS_TAG_COLOR`), `src/components/dashboard/{DashboardHeader,StatsCards,SearchBar,StatusFilter,ProjectGrid,ProjectCard}.tsx`, `src/pages/Dashboard.tsx`

**Interfaces:**
- Produces: `STATUS_TAG_COLOR` (Global Constraints ข้อ 8) — Task 9 (ProjectStatus) เรียกใช้ · SearchBar/StatusFilter/ProjectGrid/ProjectCard **props เดิมทั้งหมด**

- [ ] **Step 1: เพิ่ม `STATUS_TAG_COLOR` ใน `utils/constants.ts`** (ค่าเป๊ะตามข้อ 8)
- [ ] **Step 2: DashboardHeader** — `Typography.Title level={1}` + `<Link to="/projects/new"><Button type="primary" icon={<PlusCircleOutlined/>}>โปรเจกต์ใหม่</Button></Link>`
- [ ] **Step 3: StatsCards** — `<Row gutter={[16,16]}>/<Col xs={12} md={6}>/<Card>/<Statistic>` ×4; label คง, value คง `formatCurrency`/number; `valueStyle` สี: ทั้งหมด `colorPrimary` · กำลังทำ `colorInfo` · เสร็จแล้ว `colorSuccess` · งบรวม `colorWarning` (borderLeft accent 4px คงแนวคิด หรือใช้ valueStyle อย่างเดียว — เลือกอย่างใดอย่างหนึ่งให้ clean)
- [ ] **Step 4: SearchBar → `<Input.Search allowClear prefix={<SearchOutlined/>} …>`** — placeholder/aria-label เดิม; `onChange={e => onChange(e.target.value)}` คง props
- [ ] **Step 5: StatusFilter → `<Select>`** — options `[{value:'',label:'สถานะทั้งหมด'}, …STATUS_VALUES→STATUS_LABELS]`; `onChange={v => onChange(v ?? '')}` (กัน undefined); aria-label คง
- [ ] **Step 6: ProjectGrid → Row/Col (`xs24 sm12 lg8`) + empty → `<Empty>`** — ข้อความ "ยังไม่มีโปรเจกต์" คง + เพิ่มปุ่ม "โปรเจกต์ใหม่" ใน empty (ตาม spec02)
- [ ] **Step 7: ProjectCard → antd Card** — `cover` = antd `<Image>` (fallback div 🎭), `Typography.Title/Text ellipsis`, status → `<Tag color={STATUS_TAG_COLOR[status]}>`, actions ปุ่ม `EditOutlined/DeleteOutlined` `stopPropagation` เดิม, **คง** `role="button" tabIndex aria-label onKeyDown` + ConfirmDialog เป็น sibling, `confirmDelete/addToast/navigate` ห้ามแตะ
- [ ] **Step 8: Dashboard page** — `<Flex gap={16} wrap>` แทน flex div; states คง (Loading/ErrorMessage internal ใหม่จาก Task 3 ทำงานแล้ว)
- [ ] **Step 9: Gates** — `npm run build && npm run lint && npm test`

---

### Task 7: Project form components (ProjectForm, StatusSelect, ImageUploader, ItemForm, ItemList)

**Files:**
- Modify: `src/components/project/{ProjectForm,StatusSelect,ImageUploader,ItemForm,ItemList}.tsx`, `src/components/project/shopLinkRender.test.tsx` (ถ้า markup ItemList เปลี่ยน)

**Interfaces:**
- Consumes: `validateProject`, `validateItem` (validation.ts — เรียกอย่างเดียว ไม่แก้), `processImage`/`validateImageFile` (image.ts), `STATUS_LABELS`, `CATEGORY_VALUES`
- Produces: contracts เดิมครบ — Task 8 (Create/Edit) ไม่ต้องแก้ form interface

- [ ] **Step 1: ProjectForm → antd Form** — `layout="vertical"`, `Form.useForm()`; state ที่ **ไม่ใช่ Form field** คง: `imageFile, imageUrl, items`; field = antd: charName/seriesName `<Input maxLength>` (charName), budget `<InputNumber min={0} style={{width:'100%'}}>` (value number|null), status `<StatusSelect>`, note `<Input.TextArea rows={3} autoSize>`; sections = `<Typography.Title level={5}>` + `<Row gutter={16}>`; submit = `<Button type="primary" htmlType="submit" loading={isSubmitting}>` label คง
- [ ] **Step 2: onFinish กลยุทธ์ validation (single source)** — รูปแบบเป๊ะ:

```ts
const handleFinish = (values: FormValues) => {
  const errs = validateProject({ charName: values.charName, budget: values.budget ?? undefined, status: values.status })
  if (Object.keys(errs).length > 0) {
    form.setFields(Object.entries(errs).map(([name, msg]) => ({ name, errors: [msg] })))
    return
  }
  void onSubmit({ charName: values.charName.trim(), seriesName: (values.seriesName ?? '').trim(),
    budget: values.budget ?? 0, status: values.status, note: (values.note ?? '').trim(),
    imageFile, imageUrl, items })   // payload shape ห้ามเปลี่ยน (EditProject พึ่ง imageFile/imageUrl แยกกัน)
}
```
ข้อความ error ทั้งหมดมาจาก `validation.ts` — ห้ามเขียน rules ข้อความซ้ำ

- [ ] **Step 3: StatusSelect → antd Select** — options `STATUS_VALUES→STATUS_LABELS`; props `value/onChange/disabled` เป๊ะ
- [ ] **Step 4: ImageUploader → `<Upload.Dragger>`** — `beforeUpload={() => false}` (ห้าม auto-upload), `maxCount={1}`, `showUploadList={false}`, `accept="image/*"`; onChange ใช้ `info.file.originFileObj` → `handleFile()` **ตัวเดิมทั้งหมด** (validateImageFile → processImage → `onChange(optimized, objectUrl)` + urlRef revoke); wrapper div คง drag handlers (`isDragging` จาก event bubble); error → `<Alert type="error" showIcon>`; ปุ่มเปลี่ยน/ลบ คง + antd Button; props เป๊ะ
- [ ] **Step 5: ItemForm → antd inputs** — `Input` name / `InputNumber` price / `Input` shopLink / `Select` category / `<Button type="primary" icon={<PlusOutlined/>}>เพิ่ม</Button>`; **คง** `validateItem` + Enter-guard + disabled ตอน `!name.trim()`
- [ ] **Step 6: ItemList → antd แถวการ์ด** (`Card size="small"` หรือ `List`) — **คง** `isValidUrl` gate + `<a target="_blank" rel="noopener noreferrer">` (สี/สไตล์ผ่าน Typography/Token ใหม่)
- [ ] **Step 7: รัน + ปรับ ItemList half ของ security test**

Run: `npm test -- src/components/project/shopLinkRender.test.tsx`
Expected: PASS — ถ้า FAIL เฉพาะ case ItemList → ปรับ string ที่ match ให้ตรง markup ใหม่ **ห้ามแตะ assertion: `not.toContain('<a')` (evil), `toContain('href="https://…')`, `toContain('rel="noopener noreferrer"')` (good)**
- [ ] **Step 8: Gates** — `npm run build && npm run lint && npm test`

---

### Task 8: Create + Edit pages (render layer)

**Files:**
- Modify: `src/pages/CreateProject.tsx`, `src/pages/EditProject.tsx`

**Interfaces:**
- Consumes: contracts จาก Task 7 (ไม่ต้องแก้ฟอร์ม) · `Alert`, `Typography`, `Result`, `Spin`, `Center`/`Flex`
- Produces: หน้า status states ใหม่ให้ Task 9 copy แบบแผน (Result 404/ErrorMessage/Spin)

- [ ] **Step 1: CreateProject** — h1 → `Typography.Title level={2}`; `{error && <p …>}` → `<Alert type="error" showIcon role="alert" message={error} />`; **`handleSubmit` + submitLock + useImageUpload ห้ามแตะ** (verify: ส่วน logic ตรงกับข้อความใน spec04/03 เป๊ะ)
- [ ] **Step 2: EditProject states** — loading → `Spin size="large"` center; loadError → `<ErrorMessage message={loadError}>` + ปุ่มกลับหน้าหลัก (คง); notFound → `<Result status="404" title="ไม่พบโปรเจกต์" extra={<Button>กลับหน้าหลัก</Button>}>`; error → Alert; h1 → Typography
- [ ] **Step 3: verify image contract** — อ่าน `EditProject.handleSubmit` เทียบ spec04: `...(data.imageFile ? {} : { imageUrl: data.imageUrl })` ยังอยู่ **byte-identical** — ถ้าเผลอแก้ → ย้อน
- [ ] **Step 4: Gates** — `npm run build && npm run lint && npm test`

---

### Task 9: Project Detail ทั้งหน้า

**Files:**
- Modify: `src/pages/ProjectDetail.tsx`, `src/components/project/{ProjectHero,ProjectStatus,ProjectNote,ProjectItems}.tsx`, `src/components/project/shopLinkRender.test.tsx` (ProjectItems half)

**Interfaces:**
- Consumes: `STATUS_TAG_COLOR` (Task 6), `ConfirmDialog` (Task 3)
- Produces: — (leaf)

- [ ] **Step 1: Page** — actions → `<Space wrap>` + `Button` (`ArrowLeftOutlined` กลับ `navigate(-1)` / `primary+EditOutlined` / `danger+DeleteOutlined`); states → Spin / `<ErrorMessage>` (uniform กับหน้าอื่น) / `Result 404`; header block → `Typography.Title level={2}` + `Typography.Text secondary` + แถวงบ/รายการ `Flex` + `WalletOutlined`/`ShoppingOutlined`; `handleDelete` + `addToast` ห้ามแตะ
- [ ] **Step 2: ProjectStatus → `<Tag color={STATUS_TAG_COLOR[status]}>{STATUS_LABELS[status]}</Tag>`** (props เดิม)
- [ ] **Step 3: ProjectHero** — gradient `135deg, var(--accent), var(--purple)` (token ใหม่), รูป → antd `<Image>` (fallback 🎭 div เดิม), props เดิม
- [ ] **Step 4: ProjectNote → `<Card size="small" title="บันทึกย่อ">` + `Typography.Paragraph whiteSpace pre-wrap`** — `if (!note) return null` คง
- [ ] **Step 5: ProjectItems → antd `<List>`** — `List.Item.Meta` (title=name, description=หมวด·ราคา); ลิงก์ร้านค้า **คง `<a rel="noopener noreferrer">` หรือ Button href ที่ test ยืนยันว่าสร้าง rel**; empty → `<Empty description="ยังไม่มีรายการสินค้า" />`; `isValidUrl` gate ห้ามแตะ
- [ ] **Step 6: รัน + ปรับ ProjectItems half ของ security test** — เงื่อนไขเดียวกับ Task 7 Step 7 (case `ProjectItems …`)
- [ ] **Step 7: Gates** — `npm run build && npm run lint && npm test`

---

### Task 10: Auth — Login + Register

**Files:**
- Modify: `src/pages/Login.tsx`, `src/pages/Register.tsx`

**Interfaces:**
- Consumes: `useAuth().login/register` (ห้ามแตะ), `ERROR_MESSAGES` (คง)
- Produces: module-level `validateLogin(fields: {email,password}): Record<string,string>` / `validateRegister(fields: {email,password,confirmPassword}): Record<string,string>` — ข้อความ/ลำดับ **ชุดเดิมกับ validate() เดิม**

- [ ] **Step 1: ย้าย validate() → module function** ชื่อ `validateLogin`/`validateRegister` (คืน `Record<string,string>` เหมือนเดิมทุกข้อความ) — เรียกจาก component ต่อ (onError path เดิม)
- [ ] **Step 2: ทั้ง 2 หน้า → antd `<Form layout="vertical" noValidate form={form} onFinish={…}>`** — email `<Input prefix={<MailOutlined/>}>`, password `<Input.Password prefix={<LockOutlined/>}>` (+ confirmPassword), `Form.useForm()`; **rules ต่อ field** แบบ:

```ts
rules={[{ validator: () => {
  const msg = validateLogin({ email: form.getFieldValue('email'), password: form.getFieldValue('password') }).email
  return msg ? Promise.reject(new Error(msg)) : Promise.resolve()
}}]}
```
(เลือก key ของ field นั้น; confirm = `validateRegister(...).confirmPassword` + `dependencies={['password']}`) — antd เรียก rules ก่อน `onFinish` จึงเป็น gate เดียวกับของเดิม
- [ ] **Step 3: submit + error + footer** — `<Button type="primary" htmlType="submit" size="large" block loading={isSubmitting}>` label คง; error → `<Alert type="error" showIcon role="alert">` จาก `ERROR_MESSAGES` (ห้ามแก้ map); footer `Link` react-router คง; `submitLock` + `navigate(from,{replace:true})` **ห้ามแตะ**
- [ ] **Step 4: Gates** — `npm run build && npm run lint && npm test`

---

### Task 11: NotFound + test

**Files:**
- Modify: `src/pages/NotFound.tsx`, `src/pages/NotFound.test.tsx` (ถ้าจำเป็น)

**Interfaces:**
- Consumes: antd `Result`, `Button`, `Link` (react-router)

- [ ] **Step 1: → `<Result status="404" title="404" subTitle="ไม่พบหน้านี้ — ลิงก์อาจหมดอายุ หรือหน้าถูกลบไปแล้ว" extra={<Link to="/"><Button type="primary">กลับหน้าหลัก</Button></Link>}>`**
- [ ] **Step 2: รัน test** — `npm test -- src/pages/NotFound.test.tsx` → ต้อง PASS โดย **ไม่แก้ test** (string `404` / `ไม่พบหน้านี้` / `href="/"` เป็น substring ของ markup ใหม่) — ถ้าพลาดเพราะ markup → แก้แค่ตัว match ให้คงความหมาย
- [ ] **Step 3: Gates** — `npm run build && npm run lint && npm test`

---

### Task 12: CSS finalization — ตัดของเก่าออก

**Files:**
- Delete: `src/styles/components.css`
- Modify: `src/styles/tokens.css` (ลบ block เก่า), `src/styles/index.css` (ลบ import), `src/styles/globals.css`, `src/styles/layout.css`

**Interfaces:**
- Consumes: ชุด var ใหม่จาก Task 2

- [ ] **Step 1: ลบ `components.css` + บรรทัด `@import './components.css'` ใน `index.css`**
- [ ] **Step 2: tokens.css — ลบ block `:root` เก่า + `[data-theme='dark']` เก่า** (ชื่อ `--color-* / --font-size-* …`) เหลือเฉพาะ block ใหม่
- [ ] **Step 3: rename var ที่เหลือใน `globals.css`/`layout.css`** ตามตาราง: `--color-background→--bg`, `--color-foreground→--fg`, `--color-card→--surface`, `--color-border→--border`, `--color-muted-foreground→--muted`, `--color-muted→--surface-warm`, `--color-primary→--accent`, `--color-on-primary→--accent-on`, `--color-ring→--accent`, `--color-destructive→--danger`, `--color-secondary→--accent`, `--font-size-*→--text-*`, `--line-height-normal→--leading-body`, `--line-height-tight→--leading-tight`, `--transition-fast→--motion-fast`, `--transition-base→--motion-base`, `--radius-full→--radius-pill`, `--shadow-*→--elev-raised` (หรือลบ rule ถ้าไม่มีคนใช้ — grep ก่อน) — layout utility classes (.flex/.grid/.gap-*) ที่ **ไม่มี element ไหนเรียกแล้ว** ลบ, ตัวที่ยังถูกเรียกเก็บไว้ (grep `className="…"` ประกอบ)
- [ ] **Step 4: Verify ว่าไม่มี var เก่าหลงเหลือ + gates**

Run: `grep -rn "var(--color-\|var(--font-size-\|var(--line-height-\|var(--transition-\|var(--radius-full" src/ | grep -v tokens.css; npm run build && npm run lint && npm test`
Expected: grep ว่าง (นอกจากจะมีใน tokens.css block ใหม่ที่ไม่ควรมี) · gates ผ่าน

- [ ] **Step 5: reset `button` ใน globals** — verify ว่า antd `.ant-btn` ไม่ถูก element reset `border:none;background:none` เบียด (specificity ควรชนะ — ตรวจใน browser ตอน checklist; ถ้าเพี้ยน → ลบ rule `button{border:none;background:none}` ทิ้ง)

---

### Task 13: Final gates + บันทึก + ส่งมอบ

**Files:**
- Modify: `docs/memory.md` (append)

- [ ] **Step 1: รันครบทุก gate + จดผล**

```bash
npm run build && npm run lint && npm test
node scripts/rules-smoke-test.mjs      # ต้อง 18/18
node scripts/imgbb-smoke-test.mjs      # ต้อง 6/6
```
Expected: ผ่านทั้งหมด (test suite = 27 เดิม + ใหม่ ≥5)
- [ ] **Step 2: วัด bundle** — จด total bytes ของ build ปัจจุบัน (baseline **857,855 bytes**) เทียบกับก่อน redesign — **ยังไม่ต้อง optimize** (M8/T51 เจ้าของ budget)
- [ ] **Step 3: append `docs/memory.md`** — รายการงาน redesign: สิ่งที่เปลี่ยน, tokens ใหม่, deps ที่เพิ่ม, ผล gates, ตัวเลข bundle
- [ ] **Step 4: ส่ง browser checklist 9 ข้อจาก `09-testing.md` ให้ user ทำ** (dev server `http://localhost:5173/`) + เตือน test อัปโหลดรูป ImgBB ที่ยังค้าง + **ขอ code review** ตาม protocol repo

---

## Self-Review (บันทึกผล)

1. **Spec coverage**: ทุกไฟล์ spec มี task ครอบ — 00 (Task 1,2,6,12) · 01 (5) · 02 (6) · 03 (7) · 04 (8) · 05 (9) · 06 (10) · 07 (11) · 08 (3,4) · 09 (13) ✓
2. **Step scan**: ไม่มี step "TBD/handle edge cases"; body ของ algorithm (validate→setFields, Dragger wiring) เฉพาะที่ signature ไม่กำหนดจริง ✓
3. **Type consistency**: `createAntdTheme` / `useTheme` / `STATUS_TAG_COLOR` / `TOAST_DISMISS_MS` / `validateLogin` ใช้ชื่อเดียวกันทุก task ✓
4. **Review Focus**: 5 ข้อ มี test/step ผูกครบ (ระบุในแต่ละข้อ) ✓
5. **Proportion**: plan ~430 บรรทัด < spec 618 บรรทัด — ส่วนใหญ่เป็น decision/signature ไม่ใช่ transcript โค้ด ✓
