/**
 * Task 6 — คัดลอกข้อความ (ปุ่ม "คัดลอกลิงก์" ในหน้า Detail)
 * คืน false เมื่อ clipboard ใช้ไม่ได้ (ไม่ใช่ https / เบราว์เซอร์ปฏิเสธ / ไม่มี API)
 * → caller ต้องแสดงทางสำรอง ไม่ throw (Review Focus #3)
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return false
    }
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
