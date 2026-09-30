import { describe, expect, it } from 'vitest'
import {
  isValidUrl,
  validateConfirmPassword,
  validateEmail,
  validateItem,
  validatePassword,
  validateProject,
} from './validation'

describe('isValidUrl', () => {
  it('accepts http/https', () => {
    expect(isValidUrl('https://shopee.co.th/item/1')).toBe(true)
    expect(isValidUrl('http://example.com')).toBe(true)
  })
  it('rejects dangerous schemes', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
    expect(isValidUrl('data:text/html,x')).toBe(false)
    expect(isValidUrl('vbscript:msgbox(1)')).toBe(false)
  })
  it('rejects empty/malformed', () => {
    expect(isValidUrl('')).toBe(false)
    expect(isValidUrl('not a url')).toBe(false)
  })
})

describe('validateProject', () => {
  it('accepts valid data', () => {
    expect(validateProject({ charName: 'Rem', budget: 500, status: 'planning' })).toEqual({})
  })
  it('requires charName', () => {
    expect(validateProject({ charName: '  ' })).toHaveProperty('charName')
  })
  it('blocks negative budget and bad status', () => {
    expect(validateProject({ charName: 'Rem', budget: -1 })).toHaveProperty('budget')
    expect(validateProject({ charName: 'Rem', status: 'xxx' })).toHaveProperty('status')
  })
  it('allows empty seriesName (decision: charName only)', () => {
    expect(validateProject({ charName: 'Rem' })).toEqual({})
  })
})

describe('validateItem', () => {
  it('requires name, blocks negative price', () => {
    expect(validateItem({ name: '', price: 0 })).toHaveProperty('name')
    expect(validateItem({ name: 'วิก', price: -5 })).toHaveProperty('price')
  })
  it('blocks javascript: shopLink, allows https', () => {
    expect(validateItem({ name: 'วิก', price: 100, shopLink: 'javascript:alert(1)' })).toHaveProperty('shopLink')
    expect(validateItem({ name: 'วิก', price: 100, shopLink: 'https://a.co' })).toEqual({})
    expect(validateItem({ name: 'วิก', price: 100, shopLink: '' })).toEqual({})
  })
})

/**
 * T1 — validator กลาง (ย้ายจาก `pages/Register.tsx` ที่ซ้ำอยู่ในไฟล์เดียว)
 * ข้อความไทยต้องเหมือนเดิมทุกตัวอักษร — Register/Settings ใช้ร่วมกัน
 */
describe('validateEmail', () => {
  it('ว่าง → ขอให้กรอก', () => {
    expect(validateEmail('')).toBe('กรุณากรอกอีเมล')
    expect(validateEmail('   ')).toBe('กรุณากรอกอีเมล')
  })

  it('รูปแบบผิด → บอกตรง ๆ', () => {
    expect(validateEmail('nope')).toBe('รูปแบบอีเมลไม่ถูกต้อง')
    expect(validateEmail('a@b')).toBe('รูปแบบอีเมลไม่ถูกต้อง')
  })

  it('ถูกต้อง → ไม่มีข้อความ error', () => {
    expect(validateEmail('a@b.co')).toBe('')
  })
})

describe('validatePassword', () => {
  it('ว่าง → ขอให้กรอก', () => {
    expect(validatePassword('')).toBe('กรุณากรอกรหัสผ่าน')
  })

  it('สั้นกว่า 6 → บอกขั้นต่ำ', () => {
    expect(validatePassword('12345')).toBe('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
  })

  it('6 ขึ้นไป → ผ่าน', () => {
    expect(validatePassword('123456')).toBe('')
  })
})

describe('validateConfirmPassword', () => {
  it('ไม่ตรง → บอกไม่ตรง', () => {
    expect(validateConfirmPassword('a123456', 'b123456')).toBe('รหัสผ่านไม่ตรงกัน')
  })

  it('ตรง → ผ่าน', () => {
    expect(validateConfirmPassword('a123456', 'a123456')).toBe('')
  })
})
