import { describe, expect, it, afterEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ThemeContextProvider } from './ThemeContext'
import { useTheme } from '../hooks/useTheme'

function Probe() {
  const { theme, toggle } = useTheme()
  return <span data-testid-theme={theme} data-testid-toggle={typeof toggle} />
}

describe('ThemeContext', () => {
  afterEach(() => {
    // node ไม่มี window/localStorage — จำลองแล้วล้างหลังแต่ละเคส
    Reflect.deleteProperty(globalThis, 'window')
    Reflect.deleteProperty(globalThis, 'localStorage')
  })

  function stubStorage(stored: string | null) {
    const store: Record<string, string> = {}
    if (stored !== null) store['cosplay-theme'] = stored
    const localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
    }
    // `getInitialTheme` ข้าม storage ถ้าไม่มี window (SSR) → ต้องจำลองทั้งคู่
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: localStorage })
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage } })
  }

  it('ค่าเริ่มต้นเป็น dark (COSPLAN เป็นธีมหลัก) และ toggle เป็น function', () => {
    const html = renderToStaticMarkup(
      <ThemeContextProvider>
        <Probe />
      </ThemeContextProvider>,
    )
    expect(html).toContain('data-testid-theme="dark"')
    expect(html).toContain('data-testid-toggle="function"')
  })

  it('ถ้าเคยเลือก light ไว้ ให้จำไว้ (ไม่ดึงจากระบบ)', () => {
    stubStorage('light')
    const html = renderToStaticMarkup(
      <ThemeContextProvider>
        <Probe />
      </ThemeContextProvider>,
    )
    expect(html).toContain('data-testid-theme="light"')
  })

  it('ค่าใน localStorage เป็นของแปลก → ใช้ dark', () => {
    stubStorage('rainbow')
    const html = renderToStaticMarkup(
      <ThemeContextProvider>
        <Probe />
      </ThemeContextProvider>,
    )
    expect(html).toContain('data-testid-theme="dark"')
  })

  it('useTheme นอก provider ต้อง throw ข้อความตามข้อตกลง', () => {
    expect(() => renderToStaticMarkup(<Probe />)).toThrow(
      'useTheme ต้องใช้ภายใต้ ThemeContextProvider',
    )
  })
})
