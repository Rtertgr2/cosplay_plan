# 06 — Auth: Login (`/login`) + Register (`/register`)

## Composition ปัจจุบัน

`Login.tsx` (140) / `Register.tsx` (161): manual `<form noValidate>` + `validate()` inline + `ERROR_MESSAGES` map (Firebase codes → ไทย) +
submitLock + `useAuth().login/register` → navigate

## Strategy เดียวกันทั้งสองหน้า

**Logic ไม่แตะ**: `validate()` ยังเป็น validator ตัวจริง (เรียกจาก antd rules), `ERROR_MESSAGES` คง, submitLock คง, navigate คง (`from` redirect ของ Login คง)

### Layout / shell
| เดิม | antd |
|---|---|
| flex center + div maxWidth 400 | คง container (style เดิม + token) |
| `<h1>เข้าสู่ระบบ` / `สมัครสมาชิก` | `<Typography.Title level={2} style={{ textAlign: 'center' }}>` |
| `<form noValidate>` | `<Form layout="vertical" onFinish={handleSubmit} noValidate>` |

### Fields
| Field | antd | rules (เรียก validate() เดิม — ข้อความไทยคงเดิม) |
|---|---|---|
| email | `<Input type="email" prefix={<MailOutlined />} placeholder="you@example.com">` | required → 'กรุณากรอกอีเมล' · pattern → 'รูปแบบอีเมลไม่ถูกต้อง' |
| password | `<Input.Password prefix={<LockOutlined />}>` | required → 'กรุณากรอกรหัสผ่าน' |
| confirmPassword (register เท่านั้น) | `<Input.Password prefix={<LockOutlined />}>` | min 6 → 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' · match → 'รหัสผ่านไม่ตรงกัน' (`validator` เทียบ `getFieldValue('password')`, `dependencies={['password']}`) |

**เชื่อม validate() เดิม**: refactor เล็กน้อย — export `validate()` ของแต่ละหน้าออกเป็น function รับ object แล้ว antd rules เรียก:
```ts
rules={[{ validator: (_, value) => {
  const msg = validateLogin({ email, password })['email']  // หรือ split ราย field
  return msg ? Promise.reject(new Error(msg)) : Promise.resolve()
}}]}
```
เพื่อไม่ให้ข้อความ/เงื่อนไขซ้ำกับของเดิม — **ข้อความไทยชุดเดิมทั้งหมด**

### Error ตอน submit (Firebase auth errors)
`ERROR_MESSAGES[code]` → คง state `error` + แสดง **`<Alert type="error" showIcon role="alert" message={error} />`** (แทน `<p className="error-message">`) — ข้อความจาก map เดิม ไม่แก้

### Submit button
`<Button type="primary" htmlType="submit" size="large" block loading={isSubmitting}>` — label คง: `เข้าสู่ระบบ` / `กำลังเข้าสู่ระบบ...` · `สมัครสมาชิก` / `กำลังสมัครสมาชิก...`

### Footer link
คง `<Link to="/register">สมัครสมาชิก</Link>` ( react-router — ไม่ใช่ antd Link) + `<Typography.Text type="secondary">` ห่อข้อความ

### หมายเหตุ input states
- `disabled={isSubmitting}` → antd Input `disabled` เหมือนเดิม (หรือปล่อย Button loading จัดการ — เลือก **คง disabled** กัน double-edit ระหว่าง submit)
- antd Form validate ตอน submit + onValueChange ตาม `validateTrigger` default (`onChange`) — UX ดีขึ้นเอง ไม่ขัดกับของเดิม

## ไม่แตะ
`useAuth().login/register`, ERROR_MESSAGES map, submitLock semantics, `navigate(from, { replace: true })`, ProtectedRoute
