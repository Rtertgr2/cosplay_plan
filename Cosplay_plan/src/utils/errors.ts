/**
 * errors.ts — central error mapping (T32)
 *
 * แปลง error ทุกชนิดเป็นข้อความไทยสั้น ๆ สำหรับ user
 * ห้ามส่ง raw message / stack trace ให้ user เด็ดขาด (ข้อมูลรั่ว + ไม่เข้าใจ)
 * ข้อมูลดิบให้ log ที่ต้นทางด้วย console.error(err) แทน
 */

const MESSAGES: Record<string, string> = {
  'permission-denied': 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
  unavailable: 'การเชื่อมต่อขัดข้อง โปรดลองใหม่',
  'not-found': 'ไม่พบข้อมูลที่ต้องการ',
  'quota-exceeded': 'โควตาเต็ม โปรดลองใหม่ภายหลัง',
  'network-request-failed': 'เครือข่ายขัดข้อง โปรดลองใหม่',
  // ImgBB upload (storageService)
  'imgbb/invalid-file': 'ไฟล์ต้องเป็นรูปภาพ (ไม่รวม SVG) ขนาดไม่เกิน 5MB',
  'imgbb/missing-key': 'ยังไม่ได้ตั้งค่า API key ของ ImgBB (ดู .env.example)',
  'imgbb/unauthorized': 'API key ของ ImgBB ไม่ถูกต้อง',
  'imgbb/rate-limit': 'อัปโหลดถี่เกินไป โปรดรอสักครู่แล้วลองใหม่',
  'imgbb/network': 'เครือข่ายขัดข้อง โปรดลองใหม่',
  'imgbb/failed': 'อัปโหลดไฟล์ไม่สำเร็จ โปรดลองใหม่',
}

export const GENERIC_ERROR = 'เกิดข้อผิดพลาด โปรดลองใหม่'

/** แปลง error เป็นข้อความไทย — ไม่รู้จัก code → ข้อความ generic */
export function toUserMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const code = (error as { code?: unknown }).code
    if (typeof code === 'string' && MESSAGES[code]) {
      return MESSAGES[code]
    }
  }
  return GENERIC_ERROR
}
