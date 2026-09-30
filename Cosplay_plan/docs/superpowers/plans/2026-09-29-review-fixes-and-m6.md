# Review Fixes + M6 Validation/Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** แก้ไขช่องโหว่และข้อผิดพลาดที่พบจากการ code review ทั้งหมด (S/A/C/P) พร้อมปฏิบัติภารกิจ M6 (T28–T35 validation/security/error handling) ให้ครบ

**Architecture:** Pages → hooks → services layering ตาม `architecture.md` — หน้าจะไม่ import service โดยตรงอีกต่อไป, security rules ป้องกัน Firestore/Storage ระดับ owner, validation เป็น pure function ที่ shared ระหว่าง create/edit + defensive render ตอนแสดงผล, errors ถูก map เป็นข้อความไทยผ่าน central `toUserMessage`

**Tech Stack:** React 19 + TypeScript, Vite 8, Firebase 12 (Firestore/Auth/Storage rules), Vitest (เพิ่มใหม่)

**Spec:**
- `Cosplay_plan/docs/TASKS.md` — T28 (validation), T29 (Firestore rules), T30 (Storage rules), T31 (URL safety), T32 (error handling), T33 (duplicate submit), T34 (offline), T35 (not found), UI-02 (Sidebar)
- `Cosplay_plan/docs/architecture.md` — layer rules
- รายการผล review (แก้ตามนี้): **S1–S4** (ช่องโหว่ security), **A1–A5** (สถาปัตยกรรม), **C1–C5** (คุณภาพโค้ด), **P1–P3** (ลำดับงาน/ไฟล์หาย)

## Global Constraints

- **ห้าม git commit ทุกกรณี** จนกว่า user จะสั่ง — plan นี้ไม่มี commit steps (user instruction override skill default)
- **ห้าม `firebase deploy` ทุกชนิด** โดยไม่ได้รับอนุมัติจาก user ก่อน (constraint ก่อน deploy phase) — ขั้นตอน deploy ใน Task 7 เป็น GATE ต้องถาม user
- Build ต้องผ่านเสมอ: `cd Cosplay_plan && npm run build`
- Tests: `cd Cosplay_plan && npm test` (vitest — ติดตั้งใน Task 3)
- ภาษา UI/ข้อความ error = ไทย, comment ในโค้ด = ไทย (ตาม style ที่มีอยู่)
- **ไม่มี hex color ใน `.tsx/.ts`** นอก `src/styles/` — ใช้ `var(--color-*)` เท่านั้น (C1)
- Layer: `pages/components → hooks → services` — pages/components **ห้าม runtime import services**; `import type` (type-only) ได้รับอนุญาต
- Paths อ้างจาก repo root — app อยู่ใน `Cosplay_plan/`
- ข้อความ validation/error ภาษาไทยทุกจุด

## Findings ที่ต้องแก้ (มาจาก code review)

| ID | ปัญหา | ไปอยู่ใน task |
|---|---|---|
| S1 | shopLink รับ `javascript:` ได้ → XSS | Task 3, 4 |
| S2 | Firestore rules = stub `if false` | Task 7 |
| S3 | Storage rules = stub `if false` | Task 8 |
| S4 | ไม่มี URL validation | Task 3, 4 |
| A1 | Pages import services โดยตรง (3 หน้า) | Task 6 |
| A2 | `null as never` hack ใน useProjects | Task 6 |
| A3 | string literal `'planning'` แทน constant | Task 6 |
| A4 | uid `''` ว่างส่งให้ uploadProjectImage | Task 6 |
| A5 | Storage error swallow เงียบ `catch {}` | Task 5, 6 |
| C1/C2 | hex colors ทั่วโปรเจกต์ + 3 styling approaches | Task 2 |
| C3 | inline spinner ซ้ำกับ `.spinner`/`Loading` | Task 2 |
| C4 | error `<p>` pattern ซ้ำ 4 หน้า | Task 2, 5 |
| C5 | `Placeholder.tsx` ไม่ได้ใช้ | Task 1 |
| P1 | Legacy files ถูกลบก่อน T40 | Task 1 |
| P2 | `src/style.css` หาย (ไม่ได้ย้าย/restore) | Task 1 |
| P3 | `Sidebar.tsx` หาย (UI-02 spec) | Task 12 |

## Decisions (ต้อง confirm ตอน review)

1. **Firestore rules deploy** — ปัจจุบัน `if false` ทำให้ dev ทดสอบ CRUD กับ Firestore จริงไม่ได้เลย Task 7 มี GATE ถามก่อน deploy
2. **seriesName** — T28 เขียนว่า "required" แต่ decision ที่ตกลงไว้แล้วคือ validation = charName เท่านั้น → plan ใช้ **charName required, seriesName optional**
3. **Legacy restore** — คืนไฟล์ไปที่ตำแหน่งเดิม (repo root) เพื่อให้ legacy app รันเทียบได้จนถึง T40
4. **ยังไม่มี commit** — ตามที่เคยสั่งไว้; จะ commit เมื่อไหร่ user สั่งเอง

## Review Focus

1. **ข้อมูลเก่าที่มี shopLink อันตรายอยู่แล้วใน Firestore** — defensive render ใน Task 4 ต้องไม่สร้าง `<a>` จากข้อมูลที่ validate ไม่ผ่าน (มี test ครอบ)
2. **Firestore rules เขียน field validation แล้ว reject write ที่ถูกต้อง** — rules ต้องตรงกับ payload ของ `projectService.ts` ทุก field (ownerId, charName, seriesName, budget, status, note, imageUrl, items, createdAt, updatedAt) — มี step ตรวจทีละ field กับ service + ทดสอบ create/update จริงหลังเปลี่ยน rules
3. **Double-click guard เป็น race** — ต้องใช้ ref ที่เช็ค/ตั้งแบบ synchronous ใน handler ไม่ใช่ React state (state = stale closure) — มี manual test double-click ใน Task 9
4. **Optimistic entry ชน `.toDate()`** — `Timestamp.now()` ต้องเป็น Timestamp จริง (ไม่ใช่ null) เพื่อให้ `ProjectCard` เรียก `.toDate()` ไม่ crash — build + render test ใน Task 6
5. **upload ตอน logout กลางทาง** — `useImageUpload` ต้อง throw ข้อความไทยเมื่อไม่มี user ห้ามสร้าง path ที่มี uid ว่าง — test case ใน Task 6

---

### Task 1: Restore legacy files + ลบ Placeholder (P1, P2, C5)

**Files:**
- Restore (จาก branch `main`): `.gitignore`, `index.html`, `src/js/api.js`, `src/js/app.js`, `src/js/image.js`, `src/js/state.js`, `src/js/ui.js`, `src/style.css` (ที่ repo root)
- Delete: `Cosplay_plan/src/components/common/Placeholder.tsx`

**Interfaces:**
- Consumes: —
- Produces: — (ไม่มี code interface; คืนสถานะตาม T03/T04 ที่ยังไม่ถึง T40)

- [ ] **Step 1: Restore legacy files จาก main**

```bash
cd <repo-root>
git checkout main -- .gitignore index.html src/js src/style.css
```

- [ ] **Step 2: ยืนยันไฟล์กลับมาครบ + ไม่มีอะไร reference Placeholder**

Run: `ls src/js/ index.html src/style.css && grep -rn "Placeholder" Cosplay_plan/src/ || echo OK`
Expected: ไฟล์ครบ, `OK` (ไม่มี import Placeholder)

- [ ] **Step 3: ลบ Placeholder.tsx**

```bash
rm Cosplay_plan/src/components/common/Placeholder.tsx
```

- [ ] **Step 4: Build ผ่าน**

Run: `cd Cosplay_plan && npm run build`
Expected: PASS (ไม่มี error TS เรื่อง missing module)

---

### Task 2: Design token migration (C1, C2, C3, C4)

**Files:**
- Modify: `Cosplay_plan/src/styles/tokens.css` (เพิ่ม semantic tokens)
- Modify: ทุก `.tsx` ที่มี hex — อาทิ `Toast.tsx`, `ProjectItems.tsx`, `ItemList.tsx`, `ItemForm.tsx`, `ProjectForm.tsx`, `ProjectNote.tsx`, `ProjectInfo.tsx`, `ProjectStatus.tsx`, `ProjectHero.tsx`, `StatusSelect.tsx`, `StatsCards.tsx`, `Dashboard.tsx`, `Login.tsx`, `Register.tsx`, `CreateProject.tsx`, `EditProject.tsx`, `ProjectDetail.tsx`

**Interfaces:**
- Consumes: tokens ที่มีอยู่ (`--color-primary`, `--color-muted`, `--color-border`, `--color-destructive`, `--color-muted-foreground` ฯลฯ)
- Produces: tokens ใหม่ที่ Task อื่นใช้ต่อ — `--color-success`, `--color-success-bg`, `--color-warning`, `--color-warning-bg`, `--color-info`, `--color-info-bg`, `--color-error-bg`, `--color-primary-bg`, `--color-destructive-bg`, `--color-purple`

- [ ] **Step 1: เพิ่ม semantic tokens ใน `tokens.css`** — ทั้ง `:root` และ `[data-theme='dark']` (ค่าเข้ม/อ่อนตาม theme) ครอบคลุมทุก hex ที่จะถูกแทน:

| hex เดิม | token ใหม่/เดิม |
|---|---|
| `#6366f1`, `#8b5cf6` (indigo/purple หลัก) | `var(--color-primary)` |
| `#eef2ff` | `var(--color-primary-bg)` (ใหม่) |
| `#8b5cf6` (accent การ์ดงบ) | `var(--color-purple)` (ใหม่) |
| `#ef4444`, `#fee2e2` | `var(--color-destructive)`, `var(--color-destructive-bg)` (ใหม่) |
| `#64748b`, `#94a3b8`, `#475569` | `var(--color-muted-foreground)` |
| `#f8fafc`, `#fef2f2`, `#fffbeb`, `#eff6ff`, `#ecfdf5` (พื้น tint) | `var(--color-*-bg)` / `var(--color-muted)` |
| `#e2e8f0` | `var(--color-border)` |
| `#334155` | `var(--color-foreground)` |
| Toast: `#10b981/#ecfdf5`, `#f59e0b/#fffbeb`, `#3b82f6/#eff6ff`, `#ef4444/#fef2f2` | `--color-success(-bg)`, `--color-warning(-bg)`, `--color-info(-bg)`, `--color-destructive(-bg)` |

- [ ] **Step 2: แทน hex → `var(--color-*)` ทุกจุด** — คง inline style ไว้ แต่ค่าเป็น token ทั้งหมด
- [ ] **Step 3: Dedup C3/C4** — `Dashboard.tsx` inline spinner → `<Loading />` (จาก `components/common/Loading`); error `<p style={{color:'#ef4444'}}>` ใน Login/Register/Create/Edit → `className="error-message"`
- [ ] **Step 4: Verify — ไม่มี hex เหลือ**

Run: `grep -rn "#[0-9a-fA-F]\{6\}" Cosplay_plan/src --include="*.tsx" --include="*.ts" | grep -v "src/styles/" || echo CLEAN`
Expected: `CLEAN`

- [ ] **Step 5: Build + ตรวจธีม**

Run: `cd Cosplay_plan && npm run build`
Expected: PASS — แล้วเปิด dev server ตรวจ light/dark ไม่มีสีเพี้ยน

---

### Task 3: validation.ts + isValidUrl (T28 + T31) — TDD

**Files:**
- Create: `Cosplay_plan/src/utils/validation.ts`
- Test: `Cosplay_plan/src/utils/validation.test.ts`
- Modify: `Cosplay_plan/package.json` (vitest + test script)

**Interfaces:**
- Consumes: `PROJECT_STATUS`, `STATUS_VALUES` จาก `src/utils/constants.ts`
- Produces (Task 4 ใช้):
  - `isValidUrl(url: string): boolean`
  - `validateProject(data: { charName: string; seriesName?: string; budget?: number; status?: string }): Record<string, string>` — `{}` ถ้าผ่าน; key = field name (`charName`/`budget`/`status`), ค่า = ข้อความไทย
  - `validateItem(item: { name: string; price: number; shopLink?: string }): Record<string, string>` — key = `name`/`price`/`shopLink`

- [ ] **Step 1: ติดตั้ง vitest**

Run: `cd Cosplay_plan && npm install -D vitest`
แล้วเพิ่มใน `package.json` scripts: `"test": "vitest run"`

- [ ] **Step 2: เขียน failing tests** — `src/utils/validation.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isValidUrl, validateItem, validateProject } from './validation'

describe('isValidUrl', () => {
  it('accepts http/https', () => {
    expect(isValidUrl('https://shopee.co.th/item/1')).toBe(true)
    expect(isValidUrl('http://example.com')).toBe(true)
  })
  it('rejects dangerous schemes', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
    expect(isValidUrl('data:text/html,x')).toBe(false)
    expect(isValidUrl('vbscript:msgbox(1)')).toBe(false)
  })
  it('rejects empty/malformed', () => {
    expect(isValidUrl('')).toBe(false)
    expect(isValidUrl('not a url')).toBe(false)
  })
})

describe('validateProject', () => {
  it('accepts valid data', () => {
    expect(validateProject({ charName: 'Rem', budget: 500, status: 'planning' })).toEqual({})
  })
  it('requires charName', () => {
    expect(validateProject({ charName: '  ' })).toHaveProperty('charName')
  })
  it('blocks negative budget and bad status', () => {
    expect(validateProject({ charName: 'Rem', budget: -1 })).toHaveProperty('budget')
    expect(validateProject({ charName: 'Rem', status: 'xxx' })).toHaveProperty('status')
  })
  it('allows empty seriesName (decision: charName only)', () => {
    expect(validateProject({ charName: 'Rem' })).toEqual({})
  })
})

describe('validateItem', () => {
  it('requires name, blocks negative price', () => {
    expect(validateItem({ name: '', price: 0 })).toHaveProperty('name')
    expect(validateItem({ name: 'วิก', price: -5 })).toHaveProperty('price')
  })
  it('blocks javascript: shopLink, allows https', () => {
    expect(validateItem({ name: 'วิก', price: 100, shopLink: 'javascript:alert(1)' })).toHaveProperty('shopLink')
    expect(validateItem({ name: 'วิก', price: 100, shopLink: 'https://a.co' })).toEqual({})
    expect(validateItem({ name: 'วิก', price: 100, shopLink: '' })).toEqual({})
  })
})
```

- [ ] **Step 3: รัน — ต้อง FAIL**

Run: `cd Cosplay_plan && npm test`
Expected: FAIL (module `./validation` ไม่มี)

- [ ] **Step 4: Implement `src/utils/validation.ts`**

Approach: `isValidUrl` = ลอง `new URL(url)` ใน try/catch แล้วเช็ค `protocol === 'http:' || protocol === 'https:'` เท่านั้น (บล็อก `javascript:`/`data:`/`vbscript:` อัตโนมัติ). ข้อความไทย: `'กรุณากรอกชื่อตัวละคร'`, `'งบประมาณต้องไม่ติดลบ'`, `'สถานะไม่ถูกต้อง'`, `'ชื่อสินค้าต้องไม่เว้นว่าง'`, `'ราคาต้องไม่ติดลบ'`, `'ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://'`

- [ ] **Step 5: รัน — ต้อง PASS + build ผ่าน**

Run: `cd Cosplay_plan && npm test && npm run build`
Expected: ทุก test PASS, build PASS

---

### Task 4: Wire validation เข้า forms + defensive link render (S1, S4)

**Files:**
- Modify: `Cosplay_plan/src/components/project/ProjectForm.tsx`
- Modify: `Cosplay_plan/src/components/project/ItemForm.tsx`
- Modify: `Cosplay_plan/src/components/project/ProjectItems.tsx`
- Modify: `Cosplay_plan/src/components/project/ItemList.tsx`

**Interfaces:**
- Consumes: `validateProject`, `validateItem`, `isValidUrl` จาก Task 3
- Produces: — (ข้อมูลที่ถูก validate ก่อนเข้า service)

- [ ] **Step 1: `ProjectForm` ใช้ `validateProject`** แทน `validate()` local — แสดง error ใต้ field ด้วย `className="error-message"` + `aria-describedby` (pattern เดิมมีอยู่แล้ว)
- [ ] **Step 2: `ItemForm` ใช้ `validateItem`** — เพิ่ม state `errors` แสดงใต้ field ที่ผิด, block submit เมื่อมี error (ข้อความไทย)
- [ ] **Step 3: Defensive render ใน `ProjectItems.tsx` + `ItemList.tsx`** — เงื่อนไขเปิดลิงก์: `{isValidUrl(item.shopLink) && (<a ...>)}` — ข้อมูลเก่าที่มี `javascript:` อยู่แล้วต้องไม่ถูก render เป็น `<a>` (คง `target="_blank"` + `rel="noopener noreferrer"` ไว้)
- [ ] **Step 4: Build + manual test**

Run: `cd Cosplay_plan && npm run build` → PASS
Manual (dev server): กรอก shopLink `javascript:alert(1)` → เห็นข้อความไทยใต้ field, เพิ่มรายการไม่ได้; `https://...` → เพิ่มได้และคลิกเปิดได้
Manual (ข้อมูลเก่า — Review Focus #1): แก้ item เดิมใน Firestore ให้ `shopLink = "javascript:alert(1)"` → เปิดหน้า detail/list → **ไม่มี** `<a>` ให้คลิก (render เป็นข้อความธรรมดา/ไม่แสดง)

---

### Task 5: errors.ts — central error mapping (T32) — TDD

**Files:**
- Create: `Cosplay_plan/src/utils/errors.ts`
- Test: `Cosplay_plan/src/utils/errors.test.ts`
- Modify: `Cosplay_plan/src/hooks/useProjects.ts` (catch ผ่าน toUserMessage)

**Interfaces:**
- Consumes: —
- Produces (Task 6 ใช้): `toUserMessage(error: unknown): string`

- [ ] **Step 1: เขียน failing test** — `src/utils/errors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { toUserMessage } from './errors'

const withCode = (code: string) => Object.assign(new Error('raw'), { code })

describe('toUserMessage', () => {
  it('maps firebase codes to Thai messages', () => {
    expect(toUserMessage(withCode('permission-denied'))).toContain('สิทธิ์')
    expect(toUserMessage(withCode('unavailable'))).toContain('ลองใหม่')
    expect(toUserMessage(withCode('not-found'))).toContain('ไม่พบ')
    expect(toUserMessage(withCode('quota-exceeded'))).toContain('โควตา')
    expect(toUserMessage(withCode('storage/unauthorized'))).toContain('อัปโหลด')
    expect(toUserMessage(withCode('storage/unknown'))).toContain('อัปโหลด')
    expect(toUserMessage(withCode('network-request-failed'))).toContain('เครือข่าย')
  })
  it('falls back to generic Thai message', () => {
    expect(toUserMessage(new Error('stack...'))).toBe('เกิดข้อผิดพลาด โปรดลองใหม่')
    expect(toUserMessage(undefined)).toBe('เกิดข้อผิดพลาด โปรดลองใหม่')
  })
})
```

- [ ] **Step 2: รัน — FAIL** (`npm test`)
- [ ] **Step 3: Implement `toUserMessage(error: unknown): string`** — อ่าน `(error as {code?:string}).code` แล้ว map: `permission-denied`→`'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้'`, `unavailable`→`'การเชื่อมต่อขัดข้อง โปรดลองใหม่'`, `not-found`→`'ไม่พบข้อมูลที่ต้องการ'`, `quota-exceeded`→`'โควตาเต็ม โปรดลองใหม่ภายหลัง'`, `storage/unauthorized`→`'ไม่มีสิทธิ์อัปโหลดไฟล์นี้'`, `storage/unknown`→`'อัปโหลดไฟล์ไม่สำเร็จ โปรดลองใหม่'`, `network-request-failed`→`'เครือข่ายขัดข้อง โปรดลองใหม่'` / else → `'เกิดข้อผิดพลาด โปรดลองใหม่'` (**ห้าม** ส่ง raw message/stack ให้ user)
- [ ] **Step 4: รัน — PASS** (`npm test`)
- [ ] **Step 5: Wire useProjects** — ทุก `catch` ใน `useProjects.ts` เปลี่ยน `setError((err as Error).message || ...)` → `setError(toUserMessage(err))` — คง `console.error(err)` ไว้ต้นทาง (spec T32: developer ต้องเห็นข้อมูล)
- [ ] **Step 6: Build ผ่าน** (`npm run build`)

---

### Task 6: Layer compliance + hooks (A1, A2, A3, A4, A5)

**Files:**
- Modify: `Cosplay_plan/src/hooks/useProjects.ts`
- Create: `Cosplay_plan/src/hooks/useProject.ts`
- Create: `Cosplay_plan/src/hooks/useImageUpload.ts`
- Modify: `Cosplay_plan/src/pages/ProjectDetail.tsx`, `EditProject.tsx`, `CreateProject.tsx`

**Interfaces:**
- Consumes: `toUserMessage` จาก Task 5; `useAuth`; services (`getProjectById`, `updateProject`, `deleteProject`, `uploadProjectImage`)
- Produces:
  - `useProject(id: string | undefined): { project: Project | null; loading: boolean; notFound: boolean; error: string | null; refresh: () => Promise<void>; update: (input: UpdateProjectInput) => Promise<void>; remove: () => Promise<void> }`
  - `useImageUpload(): { uploadImage: (file: File, projectId: string) => Promise<string>; uploading: boolean }` — ดึง uid จาก `useAuth()`, upload แล้วเรียก `updateProject(projectId, { imageUrl: url })` ใน hook, throw Thai error ถ้าไม่มี user
  - `useProjects.create` แก้ A2/A3

- [ ] **Step 1: แก้ `useProjects.ts` (A2, A3)**
  - `status: input.status ?? PROJECT_STATUS.PLANNING` (import จาก constants — A3)
  - `createdAt: Timestamp.now(), updatedAt: Timestamp.now()` (import `Timestamp` จาก `firebase/firestore` — A2; ตรงกับ service ที่ใช้ `Timestamp.now()` ด้วย)
- [ ] **Step 2: สร้าง `useProject.ts`** — fetch ตาม id ตอน mount (`getProjectById`), expose signature ด้านบน; `catch` → `console.error(err)` (T32: developer ต้องเห็น) + `setError(toUserMessage(err))` + `notFound` เมื่อ return null; `update`/`remove` เรียก service แล้ว sync local state
- [ ] **Step 3: สร้าง `useImageUpload.ts`** — ตาม signature; `if (!user) throw new Error('ต้องเข้าสู่ระบบก่อน')` ก่อนสร้าง path (A4 — ไม่มีทางได้ uid ว่าง)
- [ ] **Step 4: Refactor `ProjectDetail.tsx`** — ใช้ `useProject(id)`; ลบ `import ... from '../services/projectService'` (A1)
- [ ] **Step 5: Refactor `EditProject.tsx`** — `useProject(id)` + `useImageUpload`; ลบ service imports (A1)
- [ ] **Step 6: Refactor `CreateProject.tsx`** — ใช้ `useImageUpload` แทน `uploadProjectImage`+`updateProject` ตรง ๆ; **แก้ A5**: ลบ `catch {}` เงียบ → `catch (err) { console.error(err); addToast('error', \`อัปโหลดรูปไม่สำเร็จ: ${toUserMessage(err)}\`) }` — project สร้างสำเร็จแล้ว รูปพลาดก็แจ้งให้ลองใหม่ (ใช้ `useToast`)
- [ ] **Step 7: Verify — ไม่มี runtime service import ใน pages/components**

Run: `grep -rn "from '.*services/" Cosplay_plan/src/pages Cosplay_plan/src/components | grep -v "import type" || echo CLEAN`
Expected: `CLEAN`

- [ ] **Step 8: Build + render check**

Run: `cd Cosplay_plan && npm run build` → PASS
Manual: สร้างโปรเจกต์ → การ์ดใหม่แสดงทันทีไม่ crash (ครอบ Review Focus #4 — optimistic `Timestamp.now()`); upload รูป (ถ้า Storage พร้อม) หรือจำลอง error → เห็น toast ไม่ใช่เงียบ (A5)

---

### Task 7: Firestore security rules (T29 = S2) — ⚠️ DEPLOY GATE

**Files:**
- Modify: `Cosplay_plan/firestore.rules`
- Create: `Cosplay_plan/docs/security-test.md`

**Interfaces:**
- Consumes: payload จริงจาก `projectService.ts` (ownerId, charName, seriesName, budget, status, note, imageUrl, items, createdAt, updatedAt)
- Produces: rules ที่ `firebase deploy` ได้; `docs/security-test.md`

- [ ] **Step 1: เขียน `firestore.rules`** — functions `isSignedIn()`, `isOwner(data)` (`data.ownerId == request.auth.uid`), `validFields(data)` เช็คชนิด/ช่วงค่าทุก field ตรงกับ service payload; rules:
  - `create`: signed in + `request.resource.data.ownerId == request.auth.uid` + `validFields`
  - `read`, `delete`: `isOwner(resource.data)`
  - `update`: `isOwner(resource.data)` + `validFields(request.resource.data)` (post-merge) + `ownerId` ห้ามเปลี่ยน
  - **ห้ามมี** `allow read, write: if true`
- [ ] **Step 2: ตรวจ field-by-field** — ไล่ `validFields` เทียบกับ `createProject`/`updateProject` payload ทีละบรรทัด (Review Focus #2) ทุก field ต้องถูกครอบ
- [ ] **Step 3: ทดสอบ matrix — บันทึกลง `docs/security-test.md`** — เครื่องนี้ไม่มี java (emulator ใช้ไม่ได้) → ใช้ **Firebase Console Rules Playground** จำลอง 5 กรณีตาม spec: anonymous read ❌ / A read own ✅ / B read A ❌ / create ownerId ≠ auth.uid ❌ / update+delete own ✅ (B ❌) — จดผลทุกบรรทัด
- [ ] **Step 4 (GATE): ถาม user ก่อน** — "ต้องการให้ deploy firestore rules ไหม? (ปัจจุบัน `if false` ทำให้ dev ทดสอบ CRUD ไม่ได้เลย)"
  - ถ้าอนุมัติ: `export PATH="/home/teerametr/.local/share/pnpm/bin:$PATH" && cd Cosplay_plan && firebase deploy --only firestore:rules` แล้วทดสอบ create/update/read จริงบน dev server
  - ถ้าไม่อนุมัติ: ข้าม deploy, จดสถานะ "rules เขียนแล้ว ยังไม่ deploy" ลง security-test.md
- [ ] **Step 5: Verify** — `grep "if true" firestore.rules` → ไม่มี; ถ้า deploy แล้ว: manual CRUD บน dev ผ่านทุก flow

---

### Task 8: Storage security rules (T30 = S3)

**Files:**
- Modify: `Cosplay_plan/storage.rules`
- Modify: `Cosplay_plan/docs/security-test.md` (append)

**Interfaces:**
- Consumes: path shape จาก `STORAGE_PATH.PROJECT_IMAGE` = `users/{userId}/projects/{projectId}/{filename}`
- Produces: rules พร้อม deploy เมื่อเปิด Storage (Plan B)

- [ ] **Step 1: เขียน `storage.rules`** — match `users/{userId}/projects/{allPaths=**}`:
  - `read`: signed in + `request.auth.uid == userId`
  - `write`: signed in + uid == userId + `request.resource.contentType.matches('image/.*')` + `request.resource.size <= 5 * 1024 * 1024` (5MB ตรง `VALIDATION.MAX_IMAGE_SIZE_MB`)
- [ ] **Step 2: บันทึกสถานะลง `docs/security-test.md`** — เขียน rules แล้ว, **test matrix = PENDING** เพราะ Storage ยังไม่เปิดใช้งาน (Plan B รอ Blaze) — จด test cases ที่ต้องทำเมื่อเปิด: upload own ✅ / path คนอื่น ❌ / anonymous ❌ / >5MB ❌ / non-image ❌
- [ ] **Step 3: Verify** — `grep "if true" storage.rules` → ไม่มี; **ห้าม deploy** (bucket ยังไม่มีจริง)

---

### Task 9: Prevent duplicate submit (T33)

**Files:**
- Modify: `Cosplay_plan/src/pages/CreateProject.tsx`, `EditProject.tsx`, `Login.tsx`, `Register.tsx`

**Interfaces:**
- Consumes: —
- Produces: — (guard pattern เดียวกันใน 4 หน้า)

- [ ] **Step 1: เพิ่ม ref guard ใน handler ทั้ง 4 หน้า** — `const submitLock = useRef(false)`; บรรทัดแรกของ handler: `if (submitLock.current) return; submitLock.current = true` (synchronous — กัน race จาก stale closure, Review Focus #3); ตอน failure: `submitLock.current = false` + `setIsSubmitting(false)`; ตอน success: state ค้างไว้ (กำลัง navigate ออก)
- [ ] **Step 2: ตรวจ reset logic** — ทุกหน้า: success → navigate (ค้าง disabled), failure → reset ทั้ง `isSubmitting` และ lock
- [ ] **Step 3: Build + manual test** — `npm run build` PASS; double-click ปุ่ม submit เร็ว ๆ 10 ครั้ง → สร้าง record ได้ 1 รายการ (manual บน dev)

---

### Task 10: Offline / network failure UX (T34)

**Files:**
- Modify: `Cosplay_plan/src/pages/Dashboard.tsx`

**Interfaces:**
- Consumes: `refresh` จาก `useProjects` (มีอยู่แล้ว), `ErrorMessage` จาก `components/common`, `toUserMessage` (error ถูก map แล้วใน Task 5)
- Produces: — (UX เสร็จ)

- [ ] **Step 1: Dashboard error state → `<ErrorMessage message={error} onRetry={refresh} />`** — ปุ่ม retry เรียก `refresh()` (แทน p สีแดงธรรมดา)
- [ ] **Step 2: ตรวจ form behavior** — Create/Edit: error แล้ว form data ไม่หาย (state ไม่ถูก reset — ตรวจว่าเป็นอย่างนั้นจริง)
- [ ] **Step 3: Verify** — `npm run build` PASS; manual: DevTools → Network → Offline ระหว่างใช้งาน → ทุกหน้ามี feedback ภาษาไทย ไม่ crash, กด retry ได้เมื่อกลับ online

---

### Task 11: Not found / invalid route (T35)

**Files:**
- Modify: `Cosplay_plan/src/pages/ProjectDetail.tsx` (ถ้าผลทดสอบพบ缺口)

**Interfaces:**
- Consumes: `useProject` จาก Task 6 (`notFound`, `error`)
- Produces: —

- [ ] **Step 1: ตรวจ 4 cases บน dev server** — (1) unknown route → NotFound page, (2) missing project id → "ไม่พบโปรเจกต์", (3) deleted project → เช่นเดียวกัน, (4) malformed id (`/projects/%20` หรือ string แปลก ๆ) → จับ error ได้ ไม่ uncaught
- [ ] **Step 2: ถ้า case ใด crash** — เพิ่ม catch ให้ `useProject` แสดง `notFound`/`error` ตามควร (Firestore doc id ที่ผิดรูป throw จาก `doc()` ต้อง wrap)
- [ ] **Step 3: Verify** — ทั้ง 4 cases ไม่มี runtime error ใน console; `npm run build` PASS

---

### Task 12: Sidebar — เติม gap ของ UI-02 (P3)

**Files:**
- Create: `Cosplay_plan/src/components/layout/Sidebar.tsx`
- Modify: `Cosplay_plan/src/components/layout/Layout.tsx`
- Modify: `Cosplay_plan/src/styles/layout.css` หรือ `globals.css` (responsive rules)

**Interfaces:**
- Consumes: —
- Produces: `Sidebar` default export (ไม่มี props) — nav links: หน้าหลัก `/`, สร้างใหม่ `/projects/new`

- [ ] **Step 1: สร้าง `Sidebar.tsx`** — nav desktop: ลิงก์ 2 รายการพร้อม active state (ใช้ `useLocation` เทียบ path หรือ `NavLink`), แสดงเฉพาะ ≥768px, style ด้วย token/class ที่มี (ไม่ hex)
- [ ] **Step 2: Wire เข้า `Layout.tsx`** — flex row: Sidebar (desktop) + `<main>`; MobileNav คงแสดงเฉพาะ <768px (มีอยู่แล้ว) — header คงเดิม
- [ ] **Step 3: Build + responsive test** — `npm run build` PASS; ที่ ≥768px เห็น sidebar, ที่ 390px เห็น bottom nav แทน, ไม่มี horizontal scroll

---

### Task 13: Final verification + docs update

**Files:**
- Modify: `Cosplay_plan/docs/TASKS.md` (tick T28–T35 + Progress Tracker), `Cosplay_plan/docs/memory.md`, `Cosplay_plan/docs/security-test.md` (ตรวจครบ)

**Interfaces:**
- Consumes: ผลงานทุก Task
- Produces: เอกสารอัปเดต + รายงานสถานะ

- [ ] **Step 1: Grep matrix ทั้งหมด**

```bash
cd Cosplay_plan
grep -rn "#[0-9a-fA-F]{6}" src --include="*.tsx" --include="*.ts" | grep -v "src/styles/" || echo "C1 OK"
grep -rn "from '.*services/" src/pages src/components | grep -v "import type" || echo "A1 OK"
grep -rn "null as never" src/ || echo "A2 OK"
grep -rn "?? 'planning'" src/ || echo "A3 OK"
grep -rn "if true" firestore.rules storage.rules || echo "S2/S3 OK"
grep -rn "catch {}" src/ || echo "A5 OK"
grep -rn "Placeholder" src/ || echo "C5 OK"
```
Expected: ทุกบรรทัด `OK`

- [ ] **Step 2: Full quality gate** — `npm test && npm run lint && npm run build` → PASS ทั้งหมด
- [ ] **Step 3: Manual smoke บน dev server** — login → สร้าง → แก้ → ลบ → ค้นหา/กรอง → สลับธีม → double-click submit → offline → 404 — ทุก flow มี feedback ภาษาไทย ไม่มี console error
- [ ] **Step 4: อัปเดต `docs/TASKS.md`** — tick `[x]` T28–T35 (T29/T30 จดตามสถานะจริง: deployed/pending), UI-02 เพิ่ม note Sidebar, Progress Tracker
- [ ] **Step 5: อัปเดต `docs/memory.md`** — สรุปสิ่งที่แก้ (S/A/C/P ทั้งหมด), gated items ที่เหลือ (deploy rules, Storage/Blaze, commit ยังไม่ทำ)
