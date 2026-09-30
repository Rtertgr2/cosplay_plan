import { STATUS_VALUES } from './constants'

/**
 * Validation — ตรวจสอบข้อมูลโปรเจกต์/รายการสินค้า
 * return: object ว่าง = ผ่าน, ถ้ามี error จะเป็น { fieldName: 'ข้อความไทย' }
 *
 * หมายเหตุ: seriesName ไม่บังคับ (decision จาก user — T28 เขียนว่า required แต่ตกลงใช้ charName เท่านั้น)
 */

/** ตรวจสอบ URL — อนุญาตเฉพาะ http/https เท่านั้น (กัน javascript:/data:/vbscript:) */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export interface ProjectInput {
  charName: string
  seriesName?: string
  budget?: number
  status?: string
}

/** ตรวจสอบข้อมูลโปรเจกต์ — return { field: message } ว่างถ้าผ่าน */
export function validateProject(data: ProjectInput): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.charName || !data.charName.trim()) {
    errors.charName = 'กรุณากรอกชื่อตัวละคร'
  } else if (data.charName.trim().length > 100) {
    errors.charName = 'ชื่อตัวละครต้องไม่เกิน 100 ตัวอักษร'
  }

  if (data.budget !== undefined && data.budget < 0) {
    errors.budget = 'งบประมาณต้องไม่ติดลบ'
  }

  if (data.status !== undefined && !STATUS_VALUES.includes(data.status as (typeof STATUS_VALUES)[number])) {
    errors.status = 'สถานะไม่ถูกต้อง'
  }

  return errors
}

export interface ItemInput {
  name: string
  price: number
  shopLink?: string
}

/** ตรวจสอบรายการสินค้า — return { field: message } ว่างถ้าผ่าน */
export function validateItem(item: ItemInput): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!item.name || !item.name.trim()) {
    errors.name = 'กรุณากรอกชื่อสินค้า'
  }

  if (item.price < 0) {
    errors.price = 'ราคาต้องไม่ติดลบ'
  }

  if (item.shopLink && item.shopLink.trim() && !isValidUrl(item.shopLink.trim())) {
    errors.shopLink = 'ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://'
  }

  return errors
}

/**
 * Validator ของฟอร์มบัญชี — ย้ายมาจาก `pages/Register.tsx` (ที่ซ้ำอยู่ในไฟล์เดียว)
 * ให้ Settings ใช้กฎเดียวกัน · ข้อความไทยเหมือนเดิมทุกตัวอักษร
 */

/** @returns ข้อความ error หรือ '' ถ้าถูกต้อง */
export function validateEmail(value: string): string {
  if (!value.trim()) return 'กรุณากรอกอีเมล'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'รูปแบบอีเมลไม่ถูกต้อง'
  return ''
}

export function validatePassword(value: string): string {
  if (!value) return 'กรุณากรอกรหัสผ่าน'
  if (value.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
  return ''
}

export function validateConfirmPassword(password: string, confirmPassword: string): string {
  if (password !== confirmPassword) return 'รหัสผ่านไม่ตรงกัน'
  return ''
}
