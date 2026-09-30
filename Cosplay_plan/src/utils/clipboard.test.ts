import { describe, expect, it } from 'vitest'
import { copyText } from './clipboard'

/**
 * Task 6 — คัดลอกลิงก์โปรเจกต์ (Review Focus #3: clipboard ใช้ไม่ได้ต้องไม่พังหน้าจอ)
 */

type WriteText = (text: string) => void | Promise<void>

function stubClipboard(writeText: WriteText | undefined) {
  if (writeText === undefined) {
    Reflect.deleteProperty(globalThis, 'navigator')
    return
  }
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { clipboard: { writeText } },
  })
}

describe('copyText', () => {
  it('คัดลอกสำเร็จ → true', async () => {
    const written: string[] = []
    stubClipboard(async (text: string) => {
      written.push(text)
    })

    const ok = await copyText('https://cosplan.app/projects/p1')

    expect(ok).toBe(true)
    expect(written).toContain('https://cosplan.app/projects/p1')
  })

  it('clipboard ไม่มี (เบราว์เซอร์เก่า/ไม่ใช่ https) → false ไม่ throw', async () => {
    stubClipboard(undefined)
    expect(await copyText('x')).toBe(false)
  })

  it('clipboard ถูกปฏิเสธ → false ไม่ throw', async () => {
    stubClipboard(async () => {
      throw new Error('denied')
    })
    expect(await copyText('x')).toBe(false)
  })
})
