import { VALIDATION } from '../utils/constants'
import { createStorageFilename } from '../utils/image'

/**
 * Image upload service — อัปโหลดรูปภาพผ่าน ImgBB API (บุคคลที่สาม)
 *
 * เปลี่ยนจาก Firebase Storage → ImgBB (2026-09-29):
 * Firebase Storage บังคับ Blaze plan (ผูกบัตร) ตั้งแต่ ก.พ. 2026 — โปรเจกต์นี้ไม่มีบัตร
 * → เลือก ImgBB: ฟรี ไม่มี billing, 32MB/รูป, CORS อนุญาตเบราว์เซอร์ (ทดสอบแล้ว)
 *
 * ข้อจำกัดที่ยอมรับไว้ (ดู docs/security-test.md §5):
 * - API key อยู่ใน client bundle (ไม่มี backend ให้ซ่อน) — ผลสูงสุด: รูปขึ้นบัญชี ImgBB ของเรา
 * - รูปสาธารณะถ้ามี URL (เทียบเท่า Firebase signed URL เดิม)
 * - ไม่มี API ลบที่ใช้ได้จากฝั่ง server → รูปเก่าค้างเมื่อ replace (known limitation)
 */

const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload'

/** error ที่ toUserMessage (utils/errors) แปลเป็นข้อความไทยให้ */
function imgbbError(code: string): Error {
  return Object.assign(new Error(code), { code })
}

/**
 * อัปโหลดรูปภาพโปรเจกต์ → คืน direct URL ของรูปบน ImgBB
 *
 * Validation ฝั่ง client (ตรง storage.rules เดิม — ImgBB ไม่มี rules ให้เราเขียน):
 * image/*  ·  ไม่รับ svg (XML scriptable)  ·  ≤ 5MB
 */
export async function uploadProjectImage(
  file: File,
  projectId: string,
): Promise<string> {
  if (!file.type.startsWith('image/')) throw imgbbError('imgbb/invalid-file')
  if (file.type === 'image/svg+xml') throw imgbbError('imgbb/invalid-file')
  if (file.size > VALIDATION.MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    throw imgbbError('imgbb/invalid-file')
  }

  const key = import.meta.env.VITE_IMGBB_API_KEY as string | undefined
  if (!key) throw imgbbError('imgbb/missing-key')

  const formData = new FormData()
  formData.append('image', file, createStorageFilename(file.name))
  formData.append('name', projectId)

  let res: Response
  try {
    res = await fetch(`${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw imgbbError('imgbb/network')
  }

  // ตรวจสถานะ + parse body แม้จะไม่ ok (ImgBB แจ้ง error เป็น JSON)
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    // body ไม่ใช่ JSON → ใช้ status ตัดสินอย่างเดียว
  }

  if (!res.ok) {
    if (res.status === 401) throw imgbbError('imgbb/unauthorized')
    if (res.status === 429) throw imgbbError('imgbb/rate-limit')
    // 400 บางกรณี = key ไม่ถูกต้อง ({"error":{"message":"Invalid API v1 key."}})
    const msg =
      body && typeof body === 'object' && 'error' in body
        ? String((body as { error?: { message?: string } }).error?.message ?? '')
        : ''
    if (res.status === 400 && /api.*key/i.test(msg)) throw imgbbError('imgbb/unauthorized')
    throw imgbbError('imgbb/failed')
  }

  const url =
    body && typeof body === 'object'
      ? (body as { data?: { url?: unknown } }).data?.url
      : undefined
  if (
    !body ||
    typeof body !== 'object' ||
    (body as { success?: unknown }).success !== true ||
    typeof url !== 'string' ||
    url.length === 0
  ) {
    throw imgbbError('imgbb/failed')
  }

  return url
}
