import { describe, expect, it } from 'vitest'
import { TOAST_DISMISS_MS } from './toast-context'

describe('TOAST_DISMISS_MS', () => {
  it('ตรงค่า spec: success/info 3000, warning 5000, error 6000 (ms)', () => {
    expect(TOAST_DISMISS_MS).toEqual({
      success: 3000,
      info: 3000,
      warning: 5000,
      error: 6000,
    })
  })
})
