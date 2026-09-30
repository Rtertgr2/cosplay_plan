# 07 — หน้า NotFound (`*` → 404)

## Composition ปัจจุบัน

`NotFound.tsx` (20): div.empty-state + 🧭 + `<h1>404</h1>` + "ไม่พบหน้านี้" + "ลิงก์อาจหมดอายุ หรือหน้าถูกลบไปแล้ว" + `<Link to="/">กลับหน้าหลัก</Link>`

## Delta

| เดิม | antd |
|---|---|
| div.empty-state manual | **antd `<Result status="404" title="404" subTitle="ไม่พบหน้านี้ — ลิงก์อาจหมดอายุ หรือหน้าถูกลบไปแล้ว">`** |
| Link.btn.btn-primary | `<Link to="/"><Button type="primary">กลับหน้าหลัก</Button></Link>` |

## ข้อบังคับจาก test `NotFound.test.tsx`
```
expect(html).toContain('404')
expect(html).toContain('ไม่พบหน้านี้')
expect(html).toContain('href="/"')
```
- **ข้อความต้องคง** `'404'` และ `'ไม่พบหน้านี้'` (Result title/subTitle ต้องมี string เดิมนี้เป๊ะ)
- `<Link to="/">` สร้าง `href="/"` (หรือ Button href → verify ว่า antd สร้าง `href` ถูกต้อง — ถ้าใช้ Button `href` แทน Link ให้ test ยังผ่าน)
- ถ้า test พังเพราะ markup เปลี่ยน → **แก้ test ให้ตรงพฤติกรรมใหม่เฉพาะข้อความ/layout แต่คง assertion ความหมาย** (404 + ข้อความไทย + ลิงก์กลับ) — ดู `09-testing.md`

## ไม่แตะ
route `*` ใน App.tsx
