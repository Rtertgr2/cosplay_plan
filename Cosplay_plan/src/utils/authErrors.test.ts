import { describe, expect, it } from 'vitest'
import { authErrorMessage } from './authErrors'

/**
 * T1 — แผนที่ error code ของ Firebase Auth → ข้อความไทย
 *
 * ข้อสำคัญ: Firebase Auth คืน code ที่มี prefix `auth/` เสมอ (FirebaseError.code)
 * เดิม Login/Register ทำ map key เป็น `wrong-password` (ไม่มี prefix) → ไม่มีวัน match
 * → ผู้ใช้เห็นแต่ข้อความ generic เทสต์นี้กันไม่ให้กลับไปเป็นบั๊กแบบนั้น
 */
describe('authErrorMessage', () => {
  it('แปลรหัสผ่านผิดได้ (auth/wrong-password)', () => {
    expect(authErrorMessage({ code: 'auth/wrong-password' }, 'fallback')).toBe('รหัสผ่านไม่ถูกต้อง')
  })

  it('แปลอีเมลซ้ำได้ (auth/email-already-in-use)', () => {
    expect(authErrorMessage({ code: 'auth/email-already-in-use' }, 'fallback')).toBe(
      'อีเมลนี้ถูกใช้แล้ว',
    )
  })

  it('แปล credential ผิดได้ — SDK ใหม่ใช้ auth/invalid-credential (ไม่ใช่ auth/wrong-password)', () => {
    expect(authErrorMessage({ code: 'auth/invalid-credential' }, 'fallback')).toBe(
      'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    )
  })

  it('บอกผู้ใช้ว่าต้องล็อกอินใหม่ก่อนเปลี่ยนข้อมูลบัญชี', () => {
    expect(authErrorMessage({ code: 'auth/requires-recent-login' }, 'fallback')).toBe(
      'กรุณาเข้าสู่ระบบใหม่ก่อนเปลี่ยนข้อมูลบัญชี',
    )
  })

  it('code ที่ไม่รู้จัก → ใช้ข้อความ fallback ที่ผู้เรียกให้', () => {
    expect(authErrorMessage({ code: 'auth/something-new' }, 'ลองใหม่อีกครั้ง')).toBe('ลองใหม่อีกครั้ง')
  })

  it('error ที่ไม่ใช่ Firebase (ไม่มี code / null / string) → fallback ไม่ throw', () => {
    expect(authErrorMessage(new Error('boom'), 'fallback')).toBe('fallback')
    expect(authErrorMessage(null, 'fallback')).toBe('fallback')
    expect(authErrorMessage('boom', 'fallback')).toBe('fallback')
  })
})
