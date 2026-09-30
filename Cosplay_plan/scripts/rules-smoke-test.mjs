/**
 * rules-smoke-test.mjs — ทดสอบ Firestore security rules จริง (T29)
 *
 * รัน: node scripts/rules-smoke-test.mjs   (จากโฟลเดอร์ Cosplay_plan)
 *
 * ครอบ test matrix ใน docs/security-test.md แบบ empirical
 * (เครื่องไม่มี Java → emulator ใช้ไม่ได้ → ยิงกับ rules จริงที่ deploy แล้ว)
 *
 * ต้อง deploy rules ก่อน: firebase deploy --only firestore:rules
 */
import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth'
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'

// ── config จาก .env ของ Vite ────────────────────────────────
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

const appA = initializeApp(config, 'rules-test-A')
const appB = initializeApp(config, 'rules-test-B')
const appU = initializeApp(config, 'rules-test-unauth') // ไม่ sign in = unauthenticated
const authA = getAuth(appA)
const authB = getAuth(appB)
const dbA = getFirestore(appA)
const dbB = getFirestore(appB)
const dbU = getFirestore(appU)

// ── helpers ──────────────────────────────────────────────────
const results = []
function check(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
}

const validDoc = (ownerId, overrides = {}) => ({
  ownerId,
  charName: 'เรม',
  seriesName: 'Re:Zero',
  budget: 500,
  status: 'planning',
  note: '',
  imageUrl: '',
  items: [{ name: 'วิก', price: 399, shopLink: 'https://a.co', category: 'วิก' }],
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  ...overrides,
})

async function expectDeny(promise, label) {
  try {
    await promise
    check(label, false, 'ALLOW — ควร deny')
    return false
  } catch (err) {
    const denied = err?.code === 'permission-denied'
    check(label, denied, denied ? err.code : `error อื่น: ${err?.code ?? err}`)
    return denied
  }
}

async function expectAllow(promise, label) {
  try {
    const out = await promise
    check(label, true)
    return out
  } catch (err) {
    check(label, false, `DENY ไม่คาด: ${err?.code ?? err}`)
    return null
  }
}

// ── sign in A + B (anonymous ถ้าเปิด, ไม่งั้นสร้าง account ทดสอบ) ──
async function signIn(auth, tag) {
  try {
    return (await signInAnonymously(auth)).user
  } catch (anonErr) {
    const email = `rules-smoke-${tag}-${Date.now()}@example.com`
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, 'RulesSmoke!123')
      console.log(`ℹ️  anonymous ปิดอยู่ — สร้าง account ทดสอบ: ${email}`)
      return cred.user
    } catch (emailErr) {
      throw new Error(
        `sign in ไม่ได้ทั้ง anonymous (${anonErr.code}) และ email/password (${emailErr.code}) — เปิด provider ใน Firebase Console ก่อน`,
      )
    }
  }
}

// ── matrix ───────────────────────────────────────────────────
const userA = await signIn(authA, 'a')
const userB = await signIn(authB, 'b')
console.log(`signed in: A=${userA.uid.slice(0, 8)}… B=${userB.uid.slice(0, 8)}…\n`)

// 4. create ด้วย ownerId ≠ auth.uid → deny
await expectDeny(
  setDoc(doc(collection(dbA, 'projects')), validDoc('someone-else-uid')),
  '#4 create โดย ownerId ≠ auth.uid → deny',
)

// 2. A create ของตัวเอง + อ่านกลับ → allow
const refA = doc(collection(dbA, 'projects'))
await expectAllow(setDoc(refA, validDoc(userA.uid)), 'A create ของตัวเอง → allow')
const snapA = await getDoc(refA)
check('A อ่านของตัวเอง (read หลัง create) → allow', snapA.exists())

// 1. unauthenticated อ่าน → deny (ต้องอ่านผ่าน appU ที่ไม่ได้ sign in — ไม่ใช่ refA ที่ผูก dbA)
await expectDeny(getDoc(doc(dbU, 'projects', refA.id)), '#1 unauthenticated อ่าน → deny')

// 3. B อ่านของ A → deny
await expectDeny(getDoc(doc(dbB, 'projects', refA.id)), '#3 B อ่านของ A → deny')

// 6. update เปลี่ยน ownerId → deny
await expectDeny(
  updateDoc(refA, { ownerId: 'evil-new-owner', updatedAt: Timestamp.now() }),
  '#6 update เปลี่ยน ownerId → deny',
)

// 8. create ด้วย status ผิด enum → deny
await expectDeny(
  setDoc(doc(collection(dbA, 'projects')), validDoc(userA.uid, { status: 'xxx' })),
  '#8 create status ผิด enum → deny',
)

// 9. create ด้วย budget ติดลบ → deny
await expectDeny(
  setDoc(doc(collection(dbA, 'projects')), validDoc(userA.uid, { budget: -1 })),
  '#9 create budget ติดลบ → deny',
)

// 7. create คีย์เกิน 10 → deny
await expectDeny(
  setDoc(doc(collection(dbA, 'projects')), { ...validDoc(userA.uid), extra: 1 }),
  '#7 create คีย์เกิน 10 → deny',
)

// สร้าง charName ไทย 100 ตัวอักษร → ต้อง allow (ตรง validation.ts)
const ref100 = doc(collection(dbA, 'projects'))
await expectAllow(
  setDoc(ref100, validDoc(userA.uid, { charName: 'ช'.repeat(100) })),
  'create charName ไทย 100 ตัวอักษร → allow',
)
// 101 ตัว → deny
await expectDeny(
  setDoc(doc(collection(dbA, 'projects')), validDoc(userA.uid, { charName: 'ช'.repeat(101) })),
  'create charName 101 ตัวอักษร → deny',
)

// 5a. A update ของตัวเอง → allow
await expectAllow(
  updateDoc(refA, { note: 'อัปเดตแล้ว', updatedAt: Timestamp.now() }),
  '#5a A update ของตัวเอง → allow',
)

// 10. query แบบ dashboard (where ownerId == uid + orderBy updatedAt — ตรง firestore.indexes.json)
await expectAllow(
  getDocs(
    query(
      collection(dbA, 'projects'),
      where('ownerId', '==', userA.uid),
      orderBy('updatedAt', 'desc'),
    ),
  ),
  '#10a A query ของตัวเอง (dashboard query) → allow',
)
await expectDeny(
  getDocs(
    query(
      collection(dbB, 'projects'),
      where('ownerId', '==', userA.uid),
      orderBy('updatedAt', 'desc'),
    ),
  ),
  '#10b B query ดึงของ A (ownerId == A.uid) → deny',
)

// 5b. B update ของ A → deny
await expectDeny(
  updateDoc(doc(dbB, 'projects', refA.id), { note: 'ของบี', updatedAt: Timestamp.now() }),
  '#5b B update ของ A → deny',
)

// 5d. B delete ของ A → deny
await expectDeny(deleteDoc(doc(dbB, 'projects', refA.id)), '#5d B delete ของ A → deny')

// 5c. A delete ของตัวเอง → allow
await expectAllow(deleteDoc(refA), '#5c A delete ของตัวเอง → allow')

// cleanup: ลบ doc ทดสอบกรณี charName 100
await expectAllow(deleteDoc(ref100), 'cleanup: delete doc charName 100 ตัว → allow')

// cleanup: ลบ account ทดสอบ (ไม่ให้ค้างใน Firebase Auth)
try {
  await deleteUser(userA)
  await deleteUser(userB)
  console.log('ℹ️  ลบ account ทดสอบแล้ว')
} catch (err) {
  console.warn(`⚠️  ลบ account ทดสอบไม่ได้: ${err.code ?? err}`)
}

// ── สรุป ────────────────────────────────────────────────────
const failed = results.filter((r) => !r.pass)
console.log(`\nสรุป: ${results.length - failed.length}/${results.length} ผ่าน`)
if (failed.length) {
  console.log('ล้มเหลว:')
  for (const f of failed) console.log(`  ❌ ${f.name} — ${f.detail}`)
  process.exit(1)
}
