import { theme, type ThemeConfig } from 'antd'

/**
 * ค่าธีม antd ทั้งหมดของแอป — ออกแบบจากสเปค §4.1 (COSPLAN ม่วง #7C3AED)
 * ปรับโทน = แก้ไฟล์นี้ที่เดียว + `src/styles/tokens.css` (CSS ที่ antd ไม่ครอบ)
 * ค่าสีทั้งหมดต้องตรงกับ tokens.css — `antdTheme.test.ts` กันไว้
 */
export function createAntdTheme(mode: 'light' | 'dark'): ThemeConfig {
  const isDark = mode === 'dark'

  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      // สีพื้นฐาน (seed) — คงเดิมทุกโหมด (algorithm แปลง component สีเอง)
      colorPrimary: '#7C3AED',
      colorInfo: '#0EA5E9',
      colorSuccess: '#16A34A',
      colorWarning: '#D97706',
      colorError: '#DC2626',

      // พื้นหลัง/ข้อความ/เส้นขอบ — ต่างกันตามโหมด
      colorBgLayout: isDark ? '#0B0B0F' : '#FAFAFC',
      colorBgContainer: isDark ? '#17171B' : '#ffffff',
      colorTextBase: isDark ? '#FAFAFA' : '#18181B',
      // ขอบทุกอย่าง (input/Card/divider) ตรงกัน — กันดูคนละระบบ
      colorBorder: isDark ? '#2E2E33' : '#E4E4E7',
      colorBorderSecondary: isDark ? '#2E2E33' : '#E4E4E7',

      // ความสูงช่องกรอก/ปุ่ม — 40px (antd default 32px เล็กเกินไปเมื่อ base font 16px
      // ผู้ใช้ต้องการให้ช่องกรอก "ไม่เล็ก/ไม่อึดอัด" — ปุ่ม `size="small"` ยังเป็น 24px ตามปกติ
      controlHeight: 40,

      // รูปร่าง/ตัวอักษร (เท่ากันทุกโหมด) — ตามแผน 8 / 16 / 4 + base 16px
      // หมายเหตุ: antd v6 ไม่มี token borderRadiusXL — radius 24 อยู่ที่ `--radius-xl` ใน tokens.css
      borderRadius: 8,
      borderRadiusLG: 16,
      borderRadiusSM: 4,
      fontSize: 16,
      fontFamily: "'Inter Variable', Inter, system-ui, sans-serif",
    },
  }
}
