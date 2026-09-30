# Security Test — Firestore Rules (T29)

> สร้าง: 2026-09-29 · สถานะ: **rules deploy แล้ว + ผ่าน smoke test จริง 18/18** (GATE: user อนุมัติ deploy)
> ผลทดสอบ: รัน `node scripts/rules-smoke-test.mjs` ยิง rules จริงบน production เมื่อ 2026-09-29 — **18/18 ผ่าน** (matrix §2 เต็มทุกช่อง)
> เครื่องนี้ไม่มี Java → ไม่ใช้ emulator — ทดสอบกับ rules ที่ deploy แล้วโดยตรง (email/password test accounts ถูกลบอัตโนมัติท้ายสคริปต์ · ก่อนจะมี cleanup สคริปต์เคยสร้าง `rules-smoke-*@example.com` ค้างไว้ ~5 คู่ — ลบได้ใน Firebase Console → Authentication → Users)

## 1. Field-by-field mapping (Review Focus #2)

เทียบ `validFields()` ใน `firestore.rules` กับ payload จริงใน `src/services/projectService.ts`

| Field | payload จาก service | check ใน rules | ตรงกัน? |
|---|---|---|---|
| `ownerId` | `uid` (string, มาจาก `useAuth`) | `is string` + create: `== request.auth.uid` / update: `== resource.data.ownerId` | ✅ |
| `charName` | `input.charName` (validation: non-empty, ≤ 100) | `is string && size() > 0 && size() <= 100` | ✅ |
| `seriesName` | `input.seriesName ?? ''` | `is string` | ✅ |
| `budget` | `input.budget ?? 0` (validation: ≥ 0) | `is number && >= 0` | ✅ |
| `status` | `input.status ?? PROJECT_STATUS.PLANNING` | `in ['planning','active','waiting','completed','cancelled']` | ✅ |
| `note` | `input.note ?? ''` | `is string` | ✅ |
| `imageUrl` | `input.imageUrl ?? ''` | `is string` | ✅ |
| `items` | `input.items ?? []` (ProjectItem[]) | `is list` | ✅ (ดูข้อจำกัด §3) |
| `createdAt` | `Timestamp.now()` (create), ไม่แตะตอน update | `is timestamp` | ✅ |
| `updatedAt` | `Timestamp.now()` (create + updateDoc) | `is timestamp` | ✅ |
| key set | document มี exactly 10 keys ข้างบน | `keys().hasAll([...]) && keys().hasOnly([...])` | ✅ |
| — | — | **ไม่มี** `allow read, write: if true` | ✅ |

หมายเหตุ:
- `string.size()` ของ rules นับ "number of characters" (official docs) — ตรงกับ JS `.length` สำหรับอักษรไทย/BMP → ไม่บล็อกข้อมูลที่ app อนุญาต
- `UpdateProjectInput = Partial<CreateProjectInput>` → update ไม่มีทางส่ง key นอก 10 keys (hasOnly กันอีกชั้น)
- update ใช้ `request.resource.data` = post-merge doc → ทุก key ต้องยังอยู่ครบ (ลบ field = ถูกปฏิเสธ)

## 2. Test matrix (5 กรณีตาม spec T29)

ช่อง **ผลวิเคราะห์** = เดินตามตรรกะ rules ทีละนัยยะ · ช่อง **ผลจริง** = รันจาก `node scripts/rules-smoke-test.mjs` (production rules, 2026-09-29) — **ทุกเคสตรงกับที่วิเคราะห์**

| # | กรณี | นัยยะ rules | ผลวิเคราะห์ | ผลจริง |
|---|---|---|---|---|
| 1 | anonymous อ่าน project | `read → isOwner` → `isSignedIn()` = `request.auth != null` = false | ❌ deny | ✅ deny (`permission-denied`) |
| 2 | user A อ่านของ A | `isSignedIn` = true, `ownerId == A.uid` = true | ✅ allow | ✅ allow |
| 3 | user B อ่านของ A | `ownerId` (= A.uid) `== B.uid` = false | ❌ deny | ✅ deny (`permission-denied`) |
| 4 | create โดย `ownerId ≠ request.auth.uid` | `request.resource.data.ownerId == request.auth.uid` = false | ❌ deny | ✅ deny (`permission-denied`) |
| 5a | update ของตัวเอง (field ถูกต้อง) | `isOwner` ✅ + `ownerId` ไม่เปลี่ยน ✅ + `validFields(post-merge)` ✅ | ✅ allow | ✅ allow |
| 5b | update ของคนอื่น | `isOwner` = false | ❌ deny | ✅ deny (`permission-denied`) |
| 5c | delete ของตัวเอง | `isOwner` ✅ | ✅ allow | ✅ allow |
| 5d | delete ของคนอื่น | `isOwner` = false | ❌ deny | ✅ deny (`permission-denied`) |

กรณีเสริม (นอก matrix — กัน regression):

| # | กรณี | ผลวิเคราะห์ | ผลจริง |
|---|---|---|---|
| 6 | update เปลี่ยน `ownerId` | ❌ (`request.resource.data.ownerId == resource.data.ownerId` false) | ✅ deny (`permission-denied`) |
| 7 | create field ซ้อน (คีย์เกิน 10) | ❌ (`hasOnly` false) | ✅ deny (`permission-denied`) |
| 8 | create `status: 'xxx'` | ❌ (`in [...]` false) | ✅ deny (`permission-denied`) |
| 9 | create `budget: -1` | ❌ (`>= 0` false) | ✅ deny (`permission-denied`) |
| 9b | create `charName` ไทย 100 ตัวอักษร | ✅ (`size()` นับ character ตรง validation.ts) | ✅ allow |
| 9c | create `charName` 101 ตัวอักษร | ❌ (`size() <= 100`) | ✅ deny (`permission-denied`) |
| 10a | query ของ A `where ownerId == A.uid` + `orderBy updatedAt desc` (dashboard) | ✅ (filter การันตี `isOwner`) | ✅ allow |
| 10b | query ของ B `where ownerId == A.uid` (ดึงของ A) | ❌ (filter ≠ auth.uid) | ✅ deny (`permission-denied`) |

> หมายเหตุ: บนเครื่องนี้ Anonymous auth ยังปิดอยู่ → สคริปต์ใช้ email/password test account แทน (สร้าง-ลบในสคริปต์เอง)

## 3. ข้อจำกัดที่ทราบ

1. **validate ซ้อนใน `items` ไม่ได้** — Firestore rules ไม่มีตัววนซ้ำ/quantifier สำหรับ list → ครอบแค่ `items is list` (ชนิด + key set ระดับบน) การลึก (ชื่อ/ราคาใน item) ตรวจไม่ได้ใน rules — รับความเสี่ยง: ผู้ร้ายแค่แก้ข้อมูลตัวเองได้ (owner-only write อยู่แล้ว) + client มี `validateItem` คุม
2. **ไม่มี emulator** (เครื่องไม่มี Java) → ทดสอบ matrix ด้วย smoke script ยิง production rules ตรง ๆ แทน — **รันแล้ว 18/18 ผ่าน** (2026-09-29)
3. **storage.rules** เขียนแล้ว (Task 8) — **เลิกใช้/ไม่ deploy แล้ว**: Firebase Storage บังคับ Blaze (ผูกบัตร) ตั้งแต่ ก.พ. 2026 → เปิด bucket ไม่ได้ → รูปภาพย้ายไป **ImgBB** (2026-09-29) → ดู §5 ใหม่ · เก็บ `storage.rules` ไว้เผื่อกลับมาใช้เมื่อมีบัตร

## 4. สถานะ deploy

- [x] `firebase deploy --only firestore:rules` — **deploy แล้ว 2026-09-29** (GATE: user อนุมัติ) — rules compiled + released สำเร็จ
- [x] Smoke test จริง (`node scripts/rules-smoke-test.mjs`) — **ผ่าน 18/18** (2026-09-29) หลัง user เปิด Email/Password provider ใน Console (Anonymous ยังปิด → ใช้ test account แทน · สคริปต์ลบ account ท้ายรันอัตโนมัติ)
- [x] ImgBB smoke จริง (`node scripts/imgbb-smoke-test.mjs`) — **ผ่าน 6/6** (2026-09-29) — รูปทดสอบถูกลบเองหลัง 60s
- ❌ `firebase deploy --only storage:rules` — **ยกเลิก/ไม่ต้องทำ**: ขึ้นกับ bucket ที่เปิดไม่ได้ (บังคับ Blaze) → รูปย้ายไป ImgBB แล้ว (§5) · block `storage` ถูกถอดจาก firebase.json แล้ว → M8 `firebase deploy` จะไม่แตะ storage
- หมายเหตุ: ก่อน deploy dev CRUD ใช้ไม่ได้เพราะ stub `if false` — ตอนนี้ปลดล็อกแล้ว + provider เปิดแล้ว → ทดสอบ CRUD จริงบน dev ได้

## 5. รูปภาพ — ImgBB (แทน T30/storage.rules)

สถานะ: **deploy แล้ว + smoke ผ่าน 6/6** (2026-09-29)

**เหตุผลที่เปลี่ยน:** Firebase Storage บังคับ Blaze plan (ผูกบัตร) ตั้งแต่ ก.พ. 2026 — โปรเจกต์นี้ไม่มีบัตร → เปิด bucket ไม่ได้จริง (ทดสอบแล้ว 404 ทั้ง firebasestorage.app และ appspot.com) · ทางเลือกอื่นที่ต้องใช้บัตร (Cloudflare R2: checkout + hold $5) ถูกตัดออก → เลือก **ImgBB**: ฟรี ไม่มี billing, 32MB/รูป, CORS อนุญาตเบราว์เซอร์ (ทดสอบจริง)

**โมเดลความปลอดภัย (ต่างจาก storage.rules ที่เขียนไว้เดิม):**

| ด้าน | Firebase Storage เดิม (ไม่ได้ใช้) | ImgBB (ใช้จริง) |
|---|---|---|
| write | owner-path + rules | API key ใน client bundle (ยอมรับ — ไม่มี backend ให้ซ่อน; ผลสูงสุด = รูปขึ้นบัญชี ImgBB ของเรา) |
| read | signed URL | public-with-URL (URL สุ่ม 22 ตัว — เทียบเท่า signed URL เดิม: ได้ URL = เห็นรูป) |
| owner enforcement | `request.auth.uid == userId` ใน path | ❌ ไม่มี — รูปไม่มี owner; access control จริงอยู่ที่ Firestore (`imageUrl` อ่านได้เฉพาะ owner ตาม firestore.rules ที่ deploy แล้ว) |
| server-side file check | contentType + ≤5MB ใน rules | ImgBB ปฏิเสธไฟล์ non-image เอง (พิสูจน์ด้วย I4) |

**Test matrix — รันจริงแล้ว (`node scripts/imgbb-smoke-test.mjs` → 6/6):**

| # | กรณี | คาดหวัง | ผลจริง |
|---|---|---|---|
| I1a | upload รูป PNG ด้วย key จริง (expiration=60s) | ✅ 200 + ได้ url | ✅ `HTTP 200, url=https://i.ibb.co/7xWqrDQP/smoke-test.png` |
| I1b | GET url นั้นตรง ๆ (ไม่มี key/token) | ✅ 200 + content-type image | ✅ `200, image/png` + `access-control-allow-origin: *` |
| I2 | upload ด้วย key ผิด | ❌ deny | ✅ `400 Invalid API v1 key` |
| I3 | upload ไม่ส่ง key | ❌ deny | ✅ `400` |
| I4 | upload `application/pdf` (ไฟล์ปลอม) | ❌ ปฏิเสธ | ✅ `400 Unsupported or unrecognized file format` — **ImgBB ตรวจชนิดไฟล์เอง** (ด่านที่ 2) |
| C1 | client: ไฟล์ > 5MB / non-image / svg | ❌ block ก่อนถึงเครือข่าย | ✅ unit test 10/10 (`storageService.test.ts`) — `imgbb/invalid-file` |
| C2 | client: key ใน .env หาย | ❌ ข้อความไทยชัดเจน | ✅ unit test — `imgbb/missing-key` |

**ข้อควรทราบ:**
- **WAF ของ ImgBB** ปฏิเสธไฟล์ที่มีลายเซ็นผิดโครงสร้าง/น่าสงสัย ด้วย `HTTP 400 code 103 "You have been forbidden to use this website"` — ทดสอบแล้ว: PNG ถูกโครงสร้าง (1x1 69 bytes) ผ่าน, base64 ที่ประกอบผิด → โดน · ถ้าเจอ 103 กับรูปจริง → แปลว่ารูปมีปัญหา ไม่ใช่ key/เครือข่าย (map เป็น `imgbb/failed` → "อัปโหลดไฟล์ไม่สำเร็จ โปรดลองใหม่")
- **rate**: ไม่พบ rate limit ในการทดสอบ (อัปโหลดติดกันหลายครั้งไม่โดน block — ที่โดนตอนแรกคือ WAF จากไฟล์ทดสอบ)
- **รูปเก่าค้าง**: ไม่มี API ลบฝั่ง server ที่ใช้ได้จาก client (มีแค่ `delete_url` เป็นหน้าเว็บ) → รูปเดิมค้างบน ImgBB ทุกครั้งที่ replace/remove — known limitation (เดิม deferred อยู่แล้ว)
