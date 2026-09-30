/**
 * imgbb-smoke-test.mjs — ทดสอบอัปโหลดรูปขึ้น ImgBB จริงด้วย key จาก .env
 *
 * รัน: node scripts/imgbb-smoke-test.mjs   (จากโฟลเดอร์ Cosplay_plan)
 *
 * ครอบ matrix ใน docs/security-test.md §5 แบบ empirical:
 *   I1  upload รูป ≤5MB image/*     → ได้ URL เปิดได้จริง
 *   I2  upload ด้วย key ผิด          → deny (400/401)
 *   I3  upload ไม่มี key             → deny (400)
 *   I4  upload ชนิดไฟล์อื่น (pdf)    → ขึ้นอยู่กับ client validation — ที่นี่ยิงตรงดูคำตอบจริง
 *
 * รูปทดสอบตั้ง expiration=60s (ขั้นต่ำที่ ImgBB อนุญาต) → ลบทัวเองหลัง 1 นาที
 */
import { readFileSync } from 'node:fs'

// ── key จาก .env ของ Vite ────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)
const KEY = env.VITE_IMGBB_API_KEY
if (!KEY) {
  console.error('❌ ขาด VITE_IMGBB_API_KEY ใน .env')
  process.exit(1)
}

const ENDPOINT = 'https://api.imgbb.com/1/upload'

// PNG 1x1 pixel ที่ valid จริง (69 bytes — สร้างจาก python zlib ตรวจ CRC แล้ว)
// หมายเหตุ: base64 สุ่ม/ผิดโครงสร้างจะโดน WAF ImgBB (code 103) — ใช้ไฟล์นี้เท่านั้น
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  'base64',
)

let pass = 0
let fail = 0
function report(name, ok, detail) {
  if (ok) {
    pass++
    console.log(`  ✅ ${name}${detail ? ` — ${detail}` : ''}`)
  } else {
    fail++
    console.log(`  ❌ ${name} — ${detail}`)
  }
}

async function upload({ key, image, filename, contentType, expiration }) {
  const form = new FormData()
  form.append('image', new Blob([image], { type: contentType }), filename)
  if (expiration) form.append('expiration', String(expiration))
  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key ?? '')}`, {
    method: 'POST',
    body: form,
  })
  let body = null
  try {
    body = await res.json()
  } catch {
    /* non-JSON */
  }
  return { res, body }
}

console.log('── I1: upload รูป PNG 1x1 (key จริง, expiration=60s) ──')
{
  const { res, body } = await upload({
    key: KEY,
    image: PNG_1PX,
    filename: 'smoke-test.png',
    contentType: 'image/png',
    expiration: 60,
  })
  const url = body?.data?.url
  report(
    'upload สำเร็จ + ได้ url',
    res.status === 200 && body?.success === true && typeof url === 'string',
    `HTTP ${res.status}, url=${url ?? '(none)'}`,
  )

  if (url) {
    // url ต้องเปิดได้จริงจากเบราว์เซอร์ (ไม่ต้องมี key/token)
    const get = await fetch(url, { headers: { Origin: 'http://localhost:5173' } })
    const ctype = get.headers.get('content-type') ?? ''
    report(
      'URL เปิดได้จริง + เป็น image',
      get.status === 200 && ctype.startsWith('image/'),
      `HTTP ${get.status}, content-type=${ctype}`,
    )
    const allowOrigin = get.headers.get('access-control-allow-origin')
    report(
      'CORS อนุญาต origin ของเรา (ใช้ใน <img>/canvas ได้)',
      allowOrigin === '*' || allowOrigin === 'http://localhost:5173' || allowOrigin === null,
      `access-control-allow-origin=${allowOrigin ?? '(none — <img> ใช้ได้ปกติ)'}`,
    )
  }
}

console.log('── I2: upload ด้วย key ผิด ──')
{
  const { res, body } = await upload({
    key: 'definitely-wrong-key-12345',
    image: PNG_1PX,
    filename: 'x.png',
    contentType: 'image/png',
  })
  report(
    'deny (400/401)',
    res.status === 400 || res.status === 401,
    `HTTP ${res.status}, error=${body?.error?.message ?? '(none)'}`,
  )
}

console.log('── I3: upload ไม่ส่ง key ──')
{
  const { res } = await upload({
    key: '',
    image: PNG_1PX,
    filename: 'x.png',
    contentType: 'image/png',
  })
  report('deny (400/401)', res.status === 400 || res.status === 401, `HTTP ${res.status}`)
}

console.log('── I4: upload ชนิดไฟล์อื่น (pdf) — ดูคำตอบจริงของ ImgBB ──')
{
  const { res, body } = await upload({
    key: KEY,
    image: Buffer.from('%PDF-1.4 fake'),
    filename: 'x.pdf',
    contentType: 'application/pdf',
  })
  // ไม่ fix คำตอบล่วงหน้า — บันทึกตามจริง (client validation เป็นด่านหลัก)
  report(
    'ทราบคำตอบจริง (ดู security-test.md §5)',
    true,
    `HTTP ${res.status}, success=${body?.success ?? false}, error=${body?.error?.message ?? '(none)'}`,
  )
}

console.log(`\nผล: ${pass}/${pass + fail} ผ่าน`)
if (fail > 0) process.exit(1)
console.log('ℹ️  รูปทดสอบ (I1) จะถูกลบอัตโนมัติใน 60 วินาที')
