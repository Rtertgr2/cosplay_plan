/**
 * แผนที่ error code ของ **Firebase Auth** → ข้อความไทยสั้น ๆ
 *
 * ข้อสำคัญ: `FirebaseError.code` ของ Auth มี prefix `auth/` เสมอ
 * (Firestore/ImgBB ไม่มี prefix — ของพวกนั้นอยู่ใน `errors.ts` แยกแล้ว)
 * map ที่ใส่ key ไม่มี prefix จะไม่มีวัน match → ผู้ใช้เห็นแต่ข้อความ generic
 *
 * ใช้ร่วมกันทุกหน้าที่คุยกับ Auth: Login · Register · Settings
 */
const AUTH_MESSAGES: Record<string, string> = {
  // สมัคร/เข้าสู่ระบบ
  'auth/email-already-in-use': 'อีเมลนี้ถูกใช้แล้ว',
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
  'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
  'auth/user-not-found': 'ไม่พบบัญชีผู้ใช้นี้',
  'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
  // SDK รุ่นใหม่รวม wrong-password/user-not-found เป็น invalid-credential
  'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  // เปลี่ยนอีเมล/รหัสผ่าน (ต้องยืนยันตัวตนใหม่ก่อน)
  'auth/requires-recent-login': 'กรุณาเข้าสู่ระบบใหม่ก่อนเปลี่ยนข้อมูลบัญชี',
  'auth/email-already-verified': 'อีเมลนี้ยืนยันไว้แล้ว',
  // ทั่วไป
  'auth/too-many-requests': 'ลองหลายครั้งเกินไป กรุณารอสักครู่',
  'auth/network-request-failed': 'เชื่อมต่อเครือข่างไม่ได้ กรุณาลองใหม่',
  'auth/user-disabled': 'บัญชีนี้ถูกปิดใช้งาน',
  'auth/operation-not-allowed': 'ยังไม่ได้เปิดใช้งานการเข้าสู่ระบบด้วยอีเมล',
}

/**
 * แปล error เป็นข้อความไทย — ไม่รู้จัก code (หรือไม่ใช่ FirebaseError) → `fallback`
 * @param fallback ข้อความเฉพาะของผู้เรียก เช่น 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่'
 */
export function authErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const code = (error as { code?: unknown }).code
    if (typeof code === 'string' && AUTH_MESSAGES[code]) {
      return AUTH_MESSAGES[code]
    }
  }
  return fallback
}
