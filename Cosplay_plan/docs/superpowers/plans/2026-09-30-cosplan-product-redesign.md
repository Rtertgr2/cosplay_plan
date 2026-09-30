# COSPLAN Product Redesign — Implementation Plan (V1–V3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (ทำทีละ task) หรือ superpowers:subagent-driven-development · ขั้นตอนใช้ checkbox (`- [ ]`) เพื่อติดตาม

**Goal:** เปลี่ยนแอปจาก "CRUD dashboard สีส้ม" เป็น **COSPLAN สีม่วง #7C3AED ธีมมืดเป็นหลัก** พร้อมความคืบหน้า/งบที่ใช้จริง และหน้า Detail ที่ใช้เป็น showcase ได้

**Architecture:** เปลี่ยน token/antd theme ที่ 2 ไฟล์ต้นทางเดียว (CSS + JS) ให้ตรงกัน · คำนวณ progress/spent เป็น pure function ใหม่ (ไม่เพิ่ม field ระดับโปรเจกต์) · ติด flag `done` ไว้ที่ item แล้วใช้ path `updateProject` เดิม · UI อ่านผ่าน hook/service เหมือนเดิม (ห้ามผูก Firestore ตรงใน component)

**Tech Stack:** Vite 8 + React 19 + TypeScript + react-router v8 + **antd v6** + Firebase (Firestore/Auth/ImgBB) + Vitest (node + `renderToStaticMarkup`)

**Spec:** `docs/superpowers/specs/2026-09-30-cosplan-product-redesign-design.md` (อ่านคู่กัน — แผนนี้ครอบคลุม V1–V3; **V4–V7 (Landing, ฟอร์ม 5 ขั้น, Skeleton, polish) จะเขียนแผนแยกหลังผู้ใช้ตรวจ V1–V3 ในเบราว์เซอร์**)

## Global Constraints

- **ห้าม commit** — ทุกอย่างอยู่ใน working tree บน branch `migration/react-firebase` (ผู้ใช้สั่งชัด) → ทุก task จบด้วย gates + อัปเดต ledger แทนขั้น "Commit"
- **หยุดก่อน M8 / T41–T52** — ห้าม deploy
- ห้ามแตะ `src/utils/image.ts`, `src/utils/errors.ts` · `firestore.rules` แก้ได้เฉพาะถ้าจำเป็น (ดู Amendment ด้านล่าง)
- `shopLinkRender.test.tsx` + `NotFound.test.tsx` = **ห้ามแก้** (ต้องผ่านเหมือนเดิมทุก task)
- antd static methods ห้าม (ใช้ `App.useApp()`) · component ห้าม import Firestore โดยตรง · ห้าม Base64 ใน DB
- Gates ทุก task: `npm run build` && `npm run lint` && `npm test` && `node scripts/rules-smoke-test.mjs` (ต้อง 18/18)
- Ledger: `docs/superpowers/plans/2026-09-30-cosplan-product-redesign.progress.md` (สร้างใน Task 1)
- **ห้ามแก้ไฟล์เดียวกันสองครั้งพร้อมกัน** (ทำให้ Vite เสิร์ฟโค้ดค้างกลางทาง — เคยเจอแล้ว)

## ⚠️ Amendment ต่อสเปค §4.2 (ต้องให้ผู้ใช้ยืนยัน)

สเปคเขียนว่าเก็บชื่อผู้ใช้ที่ `users/{uid}.displayName` (ต้องเพิ่ม `match /users/{userId}` ใน rules) — **แผนนี้เลือกใช้ `updateProfile` ของ Firebase Auth แทน** เพราะ: ไม่ต้องแตะ rules เลย (ลดความเสี่ยง security), Firebase Auth user มี `displayName` ให้อ่านได้อยู่แล้ว, `AuthContext` ที่มีอยู่รับค่านี้ได้ทันที · **ถ้าผู้ใช้ไม่เอายกเลิก → Task 3 ทำแบบนี้; ถ้าต้องการเก็บใน Firestore → บอกผมก่อนเริ่ม Task 3**

---

## โครงไฟล์

**สร้างใหม่**
| ไฟล์ | หน้าที่ |
|---|---|
| `src/utils/projectProgress.ts` | pure: `progressOf` / `spentOf` / `isOverBudget` |
| `src/utils/projectProgress.test.ts` | unit test ของ pure fns |
| `src/utils/clipboard.ts` | `copyText(text): Promise<boolean>` (คืน false เมื่อ clipboard ใช้ไม่ได้) |
| `src/utils/clipboard.test.ts` | success + failure |
| `src/pages/Projects.tsx` | หน้า My Projects (ค้นหา/กรอง/เรียง/ทั้งหมด) |
| `src/components/dashboard/ProjectCard.test.tsx` | test การ์ด (progress/spent/เมนู) |
| `src/components/project/ProjectItems.test.tsx` | test materials list (toggle/ปุ่มร้าน) |
| `src/pages/Dashboard.test.tsx` | test workspace (greeting/6 ล่าสุด/กิจกรรมล่าสุด/ไม่มีช่องค้นหา) |
| `src/context/AuthContext.test.tsx` | test register ส่ง displayName → updateProfile |
| `docs/superpowers/plans/2026-09-30-cosplan-product-redesign.progress.md` | ledger |

**แก้ไข**
| ไฟล์ | อะไรเปลี่ยน |
|---|---|
| `src/styles/tokens.css` | สีม่วง/นิวทรัล (light+dark) · type scale · radius · elevation · `--container-*` เดิม |
| `src/theme/antdTheme.ts` | `colorPrimary` ม่วง · สีพื้น/ข้อความ/ขอบตามโหมด · `fontSize: 16` |
| `src/context/ThemeContext.tsx` | ค่าเริ่มต้น = `'dark'` (ตัดการอ่าน `prefers-color-scheme`) |
| `src/context/ThemeContext.test.tsx` | default `'dark'` + เคส localStorage มีค่า |
| `src/theme/antdTheme.test.ts` | เพิ่ม assertion สีใหม่ |
| `src/services/projectService.ts` | `ProjectItem.done?: boolean` |
| `src/context/AuthContext.tsx` | `register(email, password, displayName?)` + ค่า `displayName` ใน context |
| `src/pages/Register.tsx` | field "ชื่อ" (ก่อน email) |
| `src/components/layout/Header.tsx` | แสดง `displayName` (fallback email) |
| `src/config/nav.tsx` | เพิ่ม `/projects` |
| `src/pages/Dashboard.tsx` | เป็น workspace: greeting · quick action · 6 ล่าสุด · กิจกรรมล่าสุด · **ย้ายการ์ดค้นหาออก** |
| `src/components/dashboard/ProjectCard.tsx` | Progress + spent/budget + เมนู `⋮` + hover |
| `src/pages/ProjectDetail.tsx` | progress/budget section · materials · ปุ่มคัดลอกลิงก์ |
| `src/components/project/ProjectItems.tsx` | checklist (toggle `done`) + ปุ่มไปร้าน |
| `src/components/project/ItemForm.tsx` | checkbox "ซื้อแล้ว" ในแถวเพิ่มรายการ |
| `src/components/project/ItemList.tsx` | แสดงสถานะซื้อแล้ว + ปุ่มซื้อ/ลบ |

---

# Task 1: Brand tokens + default dark

**Files:** Modify `src/styles/tokens.css`, `src/theme/antdTheme.ts`, `src/context/ThemeContext.tsx`, `src/context/ThemeContext.test.tsx`, `src/theme/antdTheme.test.ts` · Create ledger

**Interfaces:** ชื่อ token ทั้งหมดคงเดิม (เปลี่ยนแค่ค่า) → component ที่อ้าง `var(--accent)`/`var(--text-*)` ไม่ต้องแก้

- [ ] **Step 1: อัปเดตเทสต์ (fail ก่อน)**
  - `ThemeContext.test.tsx`: default เป็น `'dark'` (ไม่ใช่ `'light'`) + เพิ่มเคส stub `globalThis.localStorage` มี `'light'` → theme ต้องเป็น `'light'`
  - `antdTheme.test.ts`: เพิ่ม — `createAntdTheme('light').token?.colorPrimary === '#7C3AED'`, เหมือนกันทั้ง dark · `colorBgLayout` light `'#FAFAFC'` / dark `'#0B0B0F'` · `fontSize === 16`
- [ ] **Step 2: รันเทสต์ → ต้อง fail**
  `npm test -- src/context/ThemeContext.test.tsx src/theme/antdTheme.test.ts` → FAIL (ค่าเก่า)
- [ ] **Step 3: `tokens.css` — ค่าใหม่ตามสเปค §4.1**
  - light: `--accent #7C3AED` · `--bg #FAFAFC` · `--surface #ffffff` · `--surface-warm #F5F3FF` · `--fg #18181B` · `--fg-2 #3F3F46` · `--muted #71717A` · `--border #E4E4E7` · `--border-soft #F4F4F5` · `--success #16A34A` · `--warn #D97706` · `--danger #DC2626`
  - dark: `--bg #0B0B0F` · `--surface #17171B` · `--surface-warm #1F1B2E` · `--fg #FAFAFA` · `--fg-2 #D4D4D8` · `--muted #A1A1AA` · `--border #2E2E33` · `--border-soft #232328` · accent/สถานะเท่า light
  - type: `--text-xs 13px` `--text-sm 14px` `--text-base 16px` `--text-lg 18px` `--text-xl 20px` `--text-2xl 24px` `--text-3xl 32px` `--text-4xl 48px`
  - radius: `--radius-sm 8px` `--radius-md 12px` `--radius-lg 16px` `--radius-xl 24px` (`--radius-pill` คง)
  - elevation: `--elev-flat none` · `--elev-ring 0 0 0 1px var(--border)` · `--elev-card 0 2px 8px rgba(0,0,0,0.12)` · `--elev-raised 0 8px 24px rgba(0,0,0,0.32)`
  - คง `--space-*`, `--motion-*`, `--container-*`, `--z-sticky`, `--purple`, `--font-sans`, font weights เดิม
- [ ] **Step 4: `antdTheme.ts` + `ThemeContext.tsx`**
  - theme token: `colorPrimary '#7C3AED'`, `colorInfo '#0EA5E9'`, `colorSuccess '#16A34A'`, `colorWarning '#D97706'`, `colorError '#DC2626'`, `colorBgLayout` light `'#FAFAFC'` dark `'#0B0B0F'`, `colorBgContainer` light `'#ffffff'` dark `'#17171B'`, `colorTextBase` light `'#18181B'` dark `'#FAFAFA'`, `colorBorder` light `'#E4E4E7'` dark `'#2E2E33'`, `colorBorderSecondary` = เท่า `colorBorder` (ให้ขอบทุกชิ้นตรงกัน), `borderRadius 8`, `borderRadiusLG 16`, `borderRadiusSM 4`, `fontSize 16`
  - `ThemeContext.getInitialTheme()`: `const stored = localStorage.getItem(KEY); return stored === 'dark' || stored === 'light' ? stored : 'dark'` (ลบ `getSystemTheme`/`matchMedia`)
- [ ] **Step 5: เทสต์ผ่าน + gates**
  `npm test` (ต้องรวมเทสต์เดิมทั้งหมดผ่าน) && `npm run build` && `npm run lint` && `node scripts/rules-smoke-test.mjs`
- [ ] **Step 6: ledger** — ติ๊ก Task 1 + บันทึกว่า "ผู้ใช้ต้องรีเฟรชดูหน้าเว็บก่อนเริ่ม Task 2"

---

# Task 2: progress/spent เป็น pure function + `item.done`

**Files:** Modify `src/services/projectService.ts` · Create `src/utils/projectProgress.ts`, `src/utils/projectProgress.test.ts`

**Interfaces:** produces
```ts
// src/utils/projectProgress.ts
export function progressOf(items: ProjectItem[]): number      // 0..100 จำนวนเต็ม, ไม่มีรายการ = 0
export function spentOf(items: ProjectItem[]): number        // ผลรวม price เฉพาะที่ done === true
export function isOverBudget(items: ProjectItem[], budget: number): boolean
```

- [ ] **Step 1: เขียนเทสต์ก่อน** — เคส: ไม่มีรายการ → `progressOf` 0, `spentOf` 0 · items เก่าไม่มี `done` → 0/0 · ซื้อหมด → 100 · 1 จาก 4 → 25 · `spentOf` นับเฉพาะ `done` · `isOverBudget(ซื้อหมด, 0)` → false (budget 0 = ไม่เกิน)
- [ ] **Step 2: รัน → FAIL** (`Cannot find module './projectProgress'`)
- [ ] **Step 3: `ProjectItem` เพิ่ม `done?: boolean`** (optional → ข้อมูลเก่าไม่พัง)
- [ ] **Step 4: เขียน `projectProgress.ts`** — `progressOf` = `Math.round(done/total*100)` (ป้องกันหาร 0 ด้วย `total === 0 ? 0`)
- [ ] **Step 5: เทสต์ผ่าน + gates** (`npm test` + build + lint)
- [ ] **Step 6: ledger**

---

# Task 3: ชื่อผู้ใช้ (displayName) ผ่าน Firebase Auth

**Files:** Modify `src/pages/Register.tsx`, `src/context/AuthContext.tsx`, `src/components/layout/Header.tsx` · Create `src/context/AuthContext.test.tsx`

**Interfaces:** `AuthContextValue` เพิ่ม `displayName: string | null` · `register(email: string, password: string, displayName?: string): Promise<void>`

- [ ] **Step 1: เทสต์ก่อน** — `AuthContext.test.tsx`: mock `../services/firebase` → เรียก `register('a@b.c','pw','เรม')` แล้ว `updateProfile` ต้องถูกเรียกด้วย `{ displayName: 'เรม' }`; ถ้าไม่ส่ง displayName → ไม่เรียก `updateProfile`
- [ ] **Step 2: รัน → FAIL**
- [ ] **Step 3: `AuthContext`** — `register` หลัง `createUserWithEmailAndPassword` เรียก `updateProfile(auth.currentUser, { displayName })` เมื่อมีค่า · expose `displayName: user?.displayName ?? null` (auth state เปลี่ยน → ค่าใหม่) — ห้ามเพิ่ม Firestore read
- [ ] **Step 4: `Register.tsx`** — เพิ่ม `Form.Item name="displayName" label="ชื่อ"` เป็นช่องแรก + ส่งเข้า `register(email, password, displayName?.trim())` · validation: บังคับกรอก? → **ทำ optional** (ไม่บังคับ เพื่อไม่กีดกันผู้ใช้เดิม/ไม่เพิ่มกฎ validation.ts เกินจำเป็น)
- [ ] **Step 5: `Header.tsx`** — แสดง `displayName ?? user.email` (fallback ต้องไม่เป็นคำว่า "null")
- [ ] **Step 6: เทสต์ผ่าน + gates** · ตรวจ `firestore.rules` **ไม่ถูกแก้** และ rules-smoke ยัง 18/18
- [ ] **Step 7: ledger**

---

# Task 4: Dashboard เป็น workspace + หน้า /projects

**Files:** Modify `src/pages/Dashboard.tsx`, `src/config/nav.tsx` · Create `src/pages/Projects.tsx`, `src/pages/Dashboard.test.tsx` · Modify test `src/config/nav.test.tsx`

**Interfaces:** consumes `useProjects()` เดิม · produces route `/projects` · `NAV_ITEMS` = `[{ key: '/', label: 'หน้าหลัก' }, { key: '/projects', label: 'โปรเจกต์ของฉัน' }, { key: '/projects/new', label: 'สร้างใหม่' }]`

- [ ] **Step 1: เทสต์ก่อน**
  - `Dashboard.test.tsx`: mock `useProjects` ให้คืน 8 โปรเจกต์ → assert ข้อความต้อนรับ (มีชื่อผู้ใช้), การ์ดไม่เกิน 6 ใบ, มีหัวข้อ "กิจกรรมล่าสุด", **ไม่มี** `placeholder="ค้นหาชื่อตัวละคร..."` (ย้ายการ์ดค้นหาไป /projects)
  - `nav.test.tsx`: อัปเดต expected keys เป็น `['/', '/projects', '/projects/new']`
- [ ] **Step 2: รัน → FAIL**
- [ ] **Step 3: `Projects.tsx`** — `PageContainer` + `SearchBar` + `StatusFilter` + กรอง/เรียง `updatedAt` desc + `ProjectGrid` + ปุ่มสร้าง (reuse ของเดิมทั้งหมด ไม่เขียนใหม่)
- [ ] **Step 4: `Dashboard.tsx`** — greeting ตามเวลา (`ตอนเช้า/บ่าย/เย็น` + displayName ?? email) · `[+ สร้างโปรเจกต์]` · StatCards เดิม · "โปรเจกต์ของคุณ" = 6 ล่าสุด + ลิงก์ "ดูทั้งหมด →" ไป `/projects` · "กิจกรรมล่าสุด" = 5 รายการล่าสุดจาก `updatedAt` (`formatRelativeTime` เดิม)
- [ ] **Step 5: เทสต์ผ่าน + gates**
- [ ] **Step 6: ledger**

---

# Task 5: ProjectCard = portfolio item

**Files:** Modify `src/components/dashboard/ProjectCard.tsx` · Create `src/components/dashboard/ProjectCard.test.tsx`

**Interfaces:** consumes `progressOf`/`spentOf`/`isOverBudget` จาก Task 2

- [ ] **Step 1: เทสต์ก่อน** — การ์ดที่มี items 1/4 ซื้อแล้ว (price 1,200) budget 5,000 → assert มี `"25%"` และ `"฿1,200 / ฿5,000"` · spent>budget → assert `"เกินงบ"` · assert มีปุ่มเมนู `aria-label` · ไม่มีรายการ → `"0%"` และ `"฿0 / ฿5,000"`
- [ ] **Step 2: รัน → FAIL**
- [ ] **Step 3: เพิ่ม Progress** — `<Progress percent={pct} size="small" showInfo={false} />` + ข้อความเปอร์เซ็นต์ · spent/budget ใช้ `toLocaleString('th-TH')` (หน้าที่เดียวกับที่ใช้ใน Detail) · เกินงบ → `<Tag color="error">เกินงบ ฿X</Tag>`
- [ ] **Step 4: เมนู `⋮`** — `Dropdown` สองรายการ "แก้ไข" / "ลบ" (ลบยังผ่าน `ConfirmDialog` เดิม) · `aria-label="เมนูโปรเจกต์"` · `onClick`/`onKeyDown` ต้อง `stopPropagation` เพื่อไม่นำไป detail
- [ ] **Step 5: hover** — `translateY(-2px)` + `box-shadow: var(--elev-card)` ผ่าน class `.project-card` (เพิ่มใน globals.css บล็ก UI polish) และ `prefers-reduced-motion` ปิด transition
- [ ] **Step 6: เทสต์ผ่าน + gates** (ต้องรวม `shopLinkRender.test.tsx` ยังผ่าน)
- [ ] **Step 7: ledger**

---

# Task 6: Detail = showcase (progress · งบ · วัสดุ · ปุ่มร้าน · คัดลอกลิงก์)

**Files:** Modify `src/pages/ProjectDetail.tsx`, `src/components/project/ProjectItems.tsx`, `src/components/project/ItemForm.tsx`, `src/components/project/ItemList.tsx` · Create `src/components/project/ProjectItems.test.tsx`, `src/utils/clipboard.ts`, `src/utils/clipboard.test.ts`

**Interfaces:** `ProjectItems` รับ prop ใหม่ `onToggleDone?: (index: number, done: boolean) => void` · `copyText(text: string): Promise<boolean>`

- [ ] **Step 1: เทสต์ก่อน**
  - `clipboard.test.ts`: clipboard เขียนสำเร็จ → `true`; ไม่มี `navigator.clipboard` หรือ throw → `false`
  - `ProjectItems.test.tsx`: item มี `shopLink` → มี `<a>` พร้อม `target="_blank" rel="noopener noreferrer"` + `aria-label` มีชื่อสินค้า · ไม่มี link → ข้อความ "ยังไม่มีลิงก์ร้านค้า" · คลิก checkbox → `onToggleDone(0, true)`
- [ ] **Step 2: รัน → FAIL**
- [ ] **Step 3: `clipboard.ts`** — `try { await navigator.clipboard.writeText(text); return true } catch { return false }` (ป้องกัน `navigator.clipboard` undefined)
- [ ] **Step 4: `ProjectItems.tsx`** → materials list: แต่ละแถว = checkbox (`done`) + ชื่อ + ราคา + ปุ่ม "ไปที่ร้านค้า" (`isValidUrl` guard เดิม) · **markup ลิงก์ต้องเหมือนเดิมทุกตัวอักษร** เพราะ `shopLinkRender.test.tsx` คุ้มครอง
- [ ] **Step 5: `ProjectDetail.tsx`** — section "ความคืบหน้า" + "งบประมาณ" (Progress + `฿spent / ฿budget`) · ปุ่ม "คัดลอกลิงก์" → `copyText(`/projects/${id}`)` → success แจ้งเตือน "คัดลอกลิงก์แล้ว" ผ่าน `App.useApp()`; fail → แจ้งว่า "คัดลอกไม่สำเร็จ กรุณาคัดลอกเอง" · toggle วัสดุ → `update({ items: items.map(...) })` (path เดิม)
- [ ] **Step 6: `ItemForm.tsx` / `ItemList.tsx`** — เพิ่ม checkbox "ซื้อแล้ว" ในฟอร์ม + แสดงสถานะในรายการ (คง Enter-guard เดิม)
- [ ] **Step 7: เทสต์ผ่าน + gates** — ต้องมี `shopLinkRender.test.tsx` 4/4 + `NotFound.test.tsx` ผ่าน
- [ ] **Step 8: ledger**

---

# Task 7: ปิด V1–V3

- [ ] **Step 1: gates เต็มชุด** — `npm run build` && `npm run lint` && `npm test` && `node scripts/rules-smoke-test.mjs` (18/18) && ถ้าแตะ path อัปโหลด → `node scripts/imgbb-smoke-test.mjs` (6/6)
- [ ] **Step 2: grep ยืนยัน** — ไม่มี `valueStyle|addonBefore|<List` · ไม่มี `var(--color-|--font-size-|--line-height-` · `firestore.rules` ไม่ถูกแก้ · ไม่มี raw hex ใน component
- [ ] **Step 3: `docs/memory.md`** — เพิ่มหัวข้อ COSPLAN V1–V3 (สี/ธีม, progress/spent, displayName, workspace, showcase) + สถานะ + ขั้นถัดไป
- [ ] **Step 4: ส่งผู้ใช้ checklist ตรวจในเบราว์เซอร์** (ดูสีม่วงทั้ง 2 โหมด · greeting+ชื่อผู้ใช้ · progress/เกินงบในการ์ด · ติ๊กวัสดุใน Detail แล้วรีเฟรชเห็น progress เปลี่ยน · ปุ่มร้านเปิดแท็บใหม่ · คัดลอกลิงก์ · **ตัวอักษรใหญ่ขึ้นหลังเปลี่ยน type scale — หัวข้อ/ปุ่มต้องไม่ล้นกรอบ/ไม่ชนกันทุกหน้า**)
- [ ] **Step 5: ledger** — ปิด V1–V3 + เขียนแผน V4–V7 เมื่อผู้ใช้พร้อม

---

## Review Focus (5 ข้อ — แต่ละข้อผูกกับ task ที่เป็นเจ้าของ)

1. **โปรเจกต์เก่าไม่มี `done`** → progress `0%`, spent `฿0`, ไม่ error → Task 2 (เทสต์ legacy items) + Task 5 (การ์ดโปรเจกต์เก่า)
2. **spent > budget / budget = 0** → ห้ามแถบเกิน 100% ห้ามหาร 0 ต้องขึ้น "เกินงบ" → Task 2 + Task 5
3. **clipboard ใช้ไม่ได้** (ไม่ใช่ https, ถูกปฏิเสธ) → หน้าต้องบอกผู้ใช้ ไม่ค้าง ไม่ error หนัก → Task 6
4. **ผู้ใช้เดิมไม่มี `displayName`** (null) → header/greeting ต้องโชว์ email ไม่ใช่ "null"/"undefined" → Task 3
5. **ลิงก์ร้านค้าแบบ `javascript:` ในข้อมูลเก่า** → ห้ามเรนเดอร์เป็น `<a>` (XSS) → Task 6 + เทสต์เดิม `shopLinkRender.test.tsx` (ห้ามแก้)
