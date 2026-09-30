import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from '../services/firebase'

/**
 * การกระทำกับบัญชีผู้ใช้ทั้งหมดอยู่ที่นี่ (เรียก Firebase Auth SDK ตรง ๆ)
 *
 * ทำเป็นโมดูลตรง ๆ เพื่อ (1) ทดสอบได้โดยไม่ต้อง render React
 * (2) เก็บชื่อใน Auth profile = ไม่ต้องแตะ `firestore.rules` เลย
 *
 * ⚠️ `changeEmail` / `changePassword` ต้องยืนยันตัวตน (re-auth) ก่อนเสมอ
 * Firebase บังคับอยู่แล้ว แต่การเรียกให้ชัดเจนกันไม่ให้มีทางข้าม
 */

const NOT_SIGNED_IN = 'ยังไม่ได้เข้าสู่ระบบ'
const NO_EMAIL = 'บัญชีนี้ไม่มีอีเมล'

/** ผู้ใช้ที่ล็อกอินอยู่ — ไม่มี = หน้านี้ถูกเรียกผิดที่ (ข้อความไทยให้หน้าแสดงต่อได้เลย) */
function requireUser(): User {
  const user = auth.currentUser
  if (!user) throw new Error(NOT_SIGNED_IN)
  return user
}

/** ยืนยันตัวตนด้วยรหัสผ่านปัจจุบันก่อนเปลี่ยนข้อมูลสำคัญ */
async function reauthenticate(user: User, currentPassword: string): Promise<void> {
  if (!user.email) throw new Error(NO_EMAIL)
  await reauthenticateWithCredential(
    user,
    EmailAuthProvider.credential(user.email, currentPassword),
  )
}

/** สมัครสมาชิกแล้วบันทึก "ชื่อ" ลง Firebase Auth profile (ตอนสมัคร) */
export async function registerWithDisplayName(
  email: string,
  password: string,
  displayName?: string,
): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const name = displayName?.trim()
  if (name) {
    await updateProfile(credential.user, { displayName: name })
  }
}

/** เปลี่ยนชื่อที่แสดงในแอป (หน้า Settings) — ส่งค่าว่างเพื่อล้างชื่อได้ */
export async function updateDisplayName(displayName: string): Promise<void> {
  await updateProfile(requireUser(), { displayName: displayName.trim() })
}

/** เปลี่ยนอีเมล — re-auth ก่อนเสมอ */
export async function changeEmail(currentPassword: string, newEmail: string): Promise<void> {
  const user = requireUser()
  await reauthenticate(user, currentPassword)
  await updateEmail(user, newEmail.trim())
}

/** เปลี่ยนรหัสผ่าน — re-auth ก่อนเสมอ */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = requireUser()
  await reauthenticate(user, currentPassword)
  await updatePassword(user, newPassword)
}
