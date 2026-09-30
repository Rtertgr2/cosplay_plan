import { describe, expect, it } from 'vitest'
import { theme } from 'antd'
import { createAntdTheme } from './antdTheme'

/**
 * Task 1 — Brand ใหม่: COSPLAN ม่วง #7C3AED (สเปค §4.1)
 * เทสต์นี้กัน "โค้ดกับสเปคไม่ตรง" — ถ้าเปลี่ยนสีแล้วลืมอัปเดต ตัวนี้จะ fail
 */
describe('createAntdTheme', () => {
  it('light: token ตาม brand COSPLAN (ม่วง + นิวทรัล)', () => {
    const t = createAntdTheme('light')
    expect(t.algorithm).toBe(theme.defaultAlgorithm)
    expect(t.token?.colorPrimary).toBe('#7C3AED')
    expect(t.token?.colorInfo).toBe('#0EA5E9')
    expect(t.token?.colorSuccess).toBe('#16A34A')
    expect(t.token?.colorWarning).toBe('#D97706')
    expect(t.token?.colorError).toBe('#DC2626')
    expect(t.token?.colorBgLayout).toBe('#FAFAFC')
    expect(t.token?.colorBgContainer).toBe('#ffffff')
    expect(t.token?.colorTextBase).toBe('#18181B')
    expect(t.token?.colorBorder).toBe('#E4E4E7')
  })

  it('dark: darkAlgorithm + พาเลตต์นิวทรัล (accent คงม่วงทุกโหมด)', () => {
    const t = createAntdTheme('dark')
    expect(t.algorithm).toBe(theme.darkAlgorithm)
    expect(t.token?.colorBgLayout).toBe('#0B0B0F')
    expect(t.token?.colorBgContainer).toBe('#17171B')
    expect(t.token?.colorTextBase).toBe('#FAFAFA')
    expect(t.token?.colorBorder).toBe('#2E2E33')
    expect(t.token?.colorPrimary).toBe('#7C3AED')
  })

  it('ขอบทุกชิ้นตรงกัน (colorBorder = colorBorderSecondary) ไม่ให้ดูคนละระบบ', () => {
    for (const mode of ['light', 'dark'] as const) {
      const t = createAntdTheme(mode)
      expect(t.token?.colorBorderSecondary).toBe(t.token?.colorBorder)
    }
  })

  it('รูปร่าง/ตัวอักษรตามแผน: radius 8/16/4 + base 16px + Inter', () => {
    const t = createAntdTheme('light')
    expect(t.token?.borderRadius).toBe(8)
    expect(t.token?.borderRadiusLG).toBe(16)
    expect(t.token?.borderRadiusSM).toBe(4)
    expect(t.token?.fontSize).toBe(16)
    expect(t.token?.fontFamily).toContain('Inter Variable')
  })

  it('controlHeight = 40 (ช่องกรอก/ปุ่มสูงขึ้น — เดิม default 32px ดูเล็ก/อึดอัด)', () => {
    for (const mode of ['light', 'dark'] as const) {
      expect(createAntdTheme(mode).token?.controlHeight).toBe(40)
    }
  })
})
