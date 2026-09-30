import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { authErrorMessage } from '../utils/authErrors'
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
} from '../utils/validation'

interface RegisterValues {
  /** ชื่อที่แสดงในแอป (Task 3) — บันทึกลง Firebase Auth profile */
  displayName?: string
  email: string
  password: string
  confirmPassword: string
}

// เงื่อนไข/ข้อความชุดเดิมจาก validate() เดิม — split ราย field ให้ antd rules เรียก
// (spec06: ข้อความไทยชุดเดิมทั้งหมด, validate เป็น validator ตัวจริง)
// T1 — validator ย้ายไป `utils/validation.ts` ให้ Settings ใช้กฎเดียวกัน

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form] = Form.useForm<RegisterValues>()

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLock = useRef(false)

  const handleSubmit = async (values: RegisterValues) => {
    if (submitLock.current) return
    submitLock.current = true

    // rules เช็คตอนพิมพ์อยู่แล้ว — เก็บ guard ตาม validate() เดิมไว้ซ้ำชั้น (submitLock semantics)
    const validationError =
      validateEmail(values.email) ||
      validatePassword(values.password) ||
      validateConfirmPassword(values.password, values.confirmPassword)
    if (validationError) {
      setError(validationError)
      submitLock.current = false
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      await register(values.email, values.password, values.displayName)
      // success: ค้าง lock + isSubmitting ไว้ระหว่าง navigate
      navigate('/', { replace: true })
    } catch (err) {
      setError(authErrorMessage(err, 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่'))
      submitLock.current = false
      setIsSubmitting(false)
    }
  }

  return (
    // AuthLayout จัดการการจัดวางกลางจอแล้ว (T4) — หน้านี้มีแค่การ์ด
    <Card className="auth-card" style={{ width: '100%', maxWidth: 'var(--container-auth)' }}>
      <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        สมัครสมาชิก
      </Typography.Title>
        <Form form={form} layout="vertical" noValidate onFinish={handleSubmit}>
          <Form.Item name="displayName" label="ชื่อ (ไม่บังคับ)">
            <Input
              prefix={<UserOutlined />}
              placeholder="เช่น เรม"
              maxLength={50}
              autoComplete="name"
              disabled={isSubmitting}
            />
          </Form.Item>
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
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="ยืนยันรหัสผ่าน"
            dependencies={['password']}
            rules={[
              {
                validator: (_, value: string) => {
                  const msg = validateConfirmPassword(
                    form.getFieldValue('password') ?? '',
                    value ?? '',
                  )
                  return msg ? Promise.reject(new Error(msg)) : Promise.resolve()
                },
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              autoComplete="new-password"
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
            {isSubmitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </Button>
        </Form>
        <Typography.Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-4)' }}
        >
          มีบัญชีแล้ว?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>
            เข้าสู่ระบบ
          </Link>
        </Typography.Text>
    </Card>
  )
}
