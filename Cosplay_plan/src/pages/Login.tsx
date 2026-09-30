import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { authErrorMessage } from '../utils/authErrors'

interface LoginValues {
  email: string
  password: string
}

// เงื่อนไข/ข้อความชุดเดิมจาก validate() เดิม — split ราย field ให้ antd rules เรียก
// (spec06: ข้อความไทยชุดเดิมทั้งหมด, validate เป็น validator ตัวจริง)
function validateEmail(value: string): string {
  if (!value.trim()) return 'กรุณากรอกอีเมล'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'รูปแบบอีเมลไม่ถูกต้อง'
  return ''
}

function validatePassword(value: string): string {
  if (!value) return 'กรุณากรอกรหัสผ่าน'
  return ''
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // ค่าเริ่มต้น = /dashboard (เข้าแอป) ไม่ใช่ / เพราะ / คือหน้า Landing สาธารณะแล้ว (V4)
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'
  const [form] = Form.useForm<LoginValues>()

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLock = useRef(false)

  const handleSubmit = async (values: LoginValues) => {
    if (submitLock.current) return
    submitLock.current = true

    // rules เช็คตอนพิมพ์อยู่แล้ว — เก็บ guard ตาม validate() เดิมไว้ซ้ำชั้น (submitLock semantics)
    const validationError = validateEmail(values.email) || validatePassword(values.password)
    if (validationError) {
      setError(validationError)
      submitLock.current = false
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      await login(values.email, values.password)
      // success: ค้าง lock + isSubmitting ไว้ระหว่าง navigate
      navigate(from, { replace: true })
    } catch (err) {
      setError(authErrorMessage(err, 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่'))
      submitLock.current = false
      setIsSubmitting(false)
    }
  }

  return (
    // AuthLayout จัดการการจัดวางกลางจอแล้ว (T4) — หน้านี้มีแค่การ์ด
    <Card className="auth-card" style={{ width: '100%', maxWidth: 'var(--container-auth)' }}>
      <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        เข้าสู่ระบบ
      </Typography.Title>
        <Form form={form} layout="vertical" noValidate onFinish={handleSubmit}>
          <Form.Item
            name="email"
            label="อีเมล"
            rules={[
              {
                validator: (_, value: string) => {
                  const msg = validateEmail(value ?? '')
                  return msg ? Promise.reject(new Error(msg)) : Promise.resolve()
                },
              },
            ]}
          >
            <Input
              type="email"
              prefix={<MailOutlined />}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isSubmitting}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[
              {
                validator: (_, value: string) => {
                  const msg = validatePassword(value ?? '')
                  return msg ? Promise.reject(new Error(msg)) : Promise.resolve()
                },
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </Form.Item>
          {error && (
            <Alert
              type="error"
              showIcon
              closable={false}
              title={error}
              role="alert"
              style={{ marginBottom: 'var(--space-4)' }}
            />
          )}
          <Button type="primary" htmlType="submit" size="large" block loading={isSubmitting}>
            {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </Form>
        <Typography.Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-4)' }}
        >
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" style={{ color: 'var(--accent)' }}>
            สมัครสมาชิก
          </Link>
        </Typography.Text>
    </Card>
  )
}
