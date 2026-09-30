# Firebase Setup — COSPLAN

คู่มือตั้งค่าโปรเจกต์ใหม่ตั้งแต่เริ่มจน deploy ได้ · ใช้เมื่อสร้างโปรเจกต์ใหม่หรือกู้คืนจากของที่หาย

> ค่าลับทั้งหมดอยู่ใน `.env` เท่านั้น (ถูก `.gitignore` กัน) — **ห้ามใส่ค่าจริงในไฟล์เอกสารหรือโค้ด**

---

## 1. สร้างโปรเจกต์

1. เข้า [Firebase Console](https://console.firebase.google.com) → **Add project**
2. ตั้งชื่อ (เช่น `cosplay-plan`) · เลือก Analytics **ปิด** (ไม่ต้องใช้)
3. เข้า **Build → Authentication → Get started**
   - Sign-in method → **Email/Password** → เปิดใช้ → Save
4. เข้า **Build → Firestore Database → Create database**
   - **Production mode** + เลือก region (เลือกที่ใกล้ผู้ใช้)
   - ⚠️ อย่าสร้าง index เอง — ใช้ `firestore.indexes.json` ในโปรเจกต์แทน (deploy จะอัปโหลตให้)

## 2. ตั้ง Authorized domains (สำคัญ)

**Authentication → Settings → Authorized domains**

- `localhost` (ต้องมีอยู่แล้วสำหรับ dev)
- โดเมนจริง เช่น `your-app.web.app` และ `your-app.firebaseapp.com`
- โดเมน custom ถ้ามี

> ไม่เพิ่มโดเมน = ล็อกอินจากเบราว์เซอร์นั้นไม่ได้ (error `auth/unauthorized-domain`)

## 3. ค่า config ของแอป (Web SDK)

**Project settings (⚙️) → General → Your apps → Web (`</>`) → Register app**

จะได้ค่า 6 ตัว → คัดลอกไปใส่ `.env`:

```env
VITE_FIREBASE_API_KEY=<จาก Firebase Console>
VITE_FIREBASE_AUTH_DOMAIN=<โปรเจกต์>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<โปรเจกต์>
VITE_FIREBASE_STORAGE_BUCKET=<โปรเจกต์>.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<ตัวเลข>
VITE_FIREBASE_APP_ID=1:<เลข>:<เลข>:web:<hash>
```

ค่าชุดนี้**ฝังใน client bundle โดยธรรมชาติ** (เพราะเป็น Web SDK) — ความปลอดภัยไม่ได้พึ่งการซ่อนคีย์ แต่พึ่ง
`firestore.rules` + Authorized domains · ดู `docs/security-test.md` §5 เรื่อง ImgBB ที่ฝังแบบเดียวกัน

## 4. ImgBB (ที่เก็บรูป — แทน Firebase Storage)

Firebase Storage ต้องเปิด Blaze (ผูกบัตร) → โปรเจกต์นี้ใช้ **ImgBB** แทน (ฟรี ไม่ต้องใช้บัตร)

1. สมัคร [imgbb.com](https://imgbb.com/)
2. เปิด [api.imgbb.com](https://api.imgbb.com/) → **Get API key**
3. ใส่ใน `.env` → `VITE_IMGBB_API_KEY=<ค่าของคุณ>`
4. ตรวจว่าใช้ได้: `node scripts/imgbb-smoke-test.mjs` (ต้องผ่าน 6/6)

> `storage.rules` ยังอยู่ในโปรเจกต์ (deploy ไปด้วย) เผื่ออนาคตอยากกลับมาใช้ Storage

## 5. Deploy

```bash
# 1) build (tsc strict + vite)
pnpm build

# 2) กฎความปลอดภัย + hosting + storage
pnpm exec firebase deploy --only firestore:rules,storage,hosting

# 3) เช็คว่ากฎทำงานจริง (ยิง Firestore จริง — สร้าง/ลบข้อมูลทดสอบเอง)
node scripts/rules-smoke-test.mjs     # ต้องผ่าน 18/18
```

- Hosting ต้องมี rewrite `**` → `/index.html` (มีใน `firebase.json` แล้ว) ไม่งั้น deep link เช่น
  `/projects/abc` จะได้ 404
- โปรเจกต์ต้อง login ก่อน: `pnpm exec firebase login` (ครั้งเดียวต่อเครื่อง)
- `.firebaserc` ผูก project id ไว้แล้ว — เปลี่ยนโปรเจกต์ก็แก้ไฟล์นี้

## 6. เจอปัญหาบ่อย

| อาการ | สาเหตุ / แก้ |
|---|---|
| `auth/unauthorized-domain` | โดเมนยังไม่อยู่ใน Authorized domains |
| `auth/invalid-api-key` | ค่าใน `.env` ไม่ตรงกับโปรเจกต์ (หรือยังไม่ได้สร้าง `.env`) |
| `permission-denied` | ยังไม่ deploy `firestore.rules` → รันคำสั่งในข้อ 5 ข้อ 2 |
| `FirebaseError: missing-api-key` | `.env` ไม่มี `VITE_FIREBASE_API_KEY` (ดูข้อ 3) |
| อัปโหลดรูปไม่ได้ | `VITE_IMGBB_API_KEY` ไม่ได้ใส่ หรือโควตา ImgBB เต็ม |
| ล็อกอินแล้วเข้าแอปไม่ได้ | ดูค่าเริ่มต้น `from` ใน `src/pages/Login.tsx` (ต้องเป็น `/dashboard`) |
| หน้าเว็บว่างเปล่าเมื่อเปิด deep link | ไม่มี SPA rewrite ใน `firebase.json` |

## 7. ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
|---|---|
| `.env` / `.env.example` | ค่า config (จริง/ตัวอย่าง) |
| `firestore.rules` | กฎการเข้าถึงข้อมูล (ownerId scoped) |
| `firestore.indexes.json` | composite index ที่ต้องใช้ |
| `storage.rules` | กฎ Storage (เผื่ออนาคต) |
| `firebase.json` | hosting rewrite + ผูก rules/indexes |
| `.firebaserc` | project id ที่ deploy |
| `docs/security-test.md` | ผลทดสอบความปลอดภัย 18/18 |
| `scripts/rules-smoke-test.mjs` | ทดสอบกฎกับ Firestore จริง |
| `scripts/imgbb-smoke-test.mjs` | ทดสอบ ImgBB จริง (6/6) |
