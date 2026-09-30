import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

/**
 * Firebase SDK initialization
 * อ่าน config จาก environment variables (import.meta.env) — ไม่ hard-code key
 *
 * ต้องมี .env ที่มีค่าครบ 5 ค่า (ดู .env.example)
 * (storageBucket ถูกถอดออก — รูปภาพย้ายไป ImgBB แล้ว ไม่ใช้ Firebase Storage)
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
}

// ตรวจว่า config ครบก่อน initialize
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingKeys.length > 0) {
  throw new Error(
    `Firebase config ไม่ครบ — ขาด: ${missingKeys.join(', ')}\n` +
      `กรุณาตรวจ .env (ดู .env.example)`,
  )
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)

export default app
