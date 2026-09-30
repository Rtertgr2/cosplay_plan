import { describe, expect, it } from 'vitest'
import { toUserMessage } from './errors'

const withCode = (code: string) => Object.assign(new Error('raw'), { code })

describe('toUserMessage', () => {
  it('maps firebase codes to Thai messages', () => {
    expect(toUserMessage(withCode('permission-denied'))).toContain('สิทธิ์')
    expect(toUserMessage(withCode('unavailable'))).toContain('ลองใหม่')
    expect(toUserMessage(withCode('not-found'))).toContain('ไม่พบ')
    expect(toUserMessage(withCode('quota-exceeded'))).toContain('โควตา')
    expect(toUserMessage(withCode('imgbb/unauthorized'))).toContain('API key')
    expect(toUserMessage(withCode('imgbb/failed'))).toContain('อัปโหลด')
    expect(toUserMessage(withCode('network-request-failed'))).toContain('เครือข่าย')
  })
  it('falls back to generic Thai message', () => {
    expect(toUserMessage(new Error('stack...'))).toBe('เกิดข้อผิดพลาด โปรดลองใหม่')
    expect(toUserMessage(undefined)).toBe('เกิดข้อผิดพลาด โปรดลองใหม่')
  })
  it('never leaks raw error message/stack', () => {
    const raw = Object.assign(new Error('Secret internals at line 42'), { code: 'weird-code' })
    expect(toUserMessage(raw)).not.toContain('Secret')
    expect(toUserMessage(raw)).toBe('เกิดข้อผิดพลาด โปรดลองใหม่')
  })
})
