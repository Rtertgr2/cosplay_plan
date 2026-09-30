import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Input, Space, Typography } from 'antd'
import { useRef, useState } from 'react'
import { validateEmail } from '../../utils/validation'

interface EmailFormValues {
  currentPassword: string
  newEmail: string
  confirmEmail: string
}

interface EmailFormProps {
  currentEmail: string
  /** คืน error เป็นข้อความไทยให้หน้าแสดง (null = สำเร็จ) */
  onSubmit: (currentPassword: string, newEmail: string) => Promise<string | null>
  onSuccess: () => void
}

/**
 * เปลี่ยนอีเมล (Firebase Auth บังคับ re-auth ก่อน)
 * ฟอร์มพับอยู่ก่อน — ไม่มีช่องรหัสผ่านเปล่า ๆ ให้เผลอเผย
 */
export default function EmailForm({ currentEmail, onSubmit, onSuccess }: EmailFormProps) {
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLock = useRef(false)

  const handleFinish = async (values: EmailFormValues) => {
    if (submitLock.current) return
    submitLock.current = true
    setError('')
    setIsSubmitting(true)
    try {
      const message = await onSubmit(values.currentPassword, values.newEmail)
      if (message) {
        setError(message)
        return
      }
      form.resetFields()
      setIsEditing(false)
      onSuccess()
    } finally {
      submitLock.current = false
      setIsSubmitting(false)
    }
  }

  if (!isEditing) {
    return (
      <div>
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>
          อีเมล
        </Typography.Text>
        <Space wrap>
          <Typography.Text strong>{currentEmail}</Typography.Text>
          <Button size="small" onClick={() => setIsEditing(true)}>
            เปลี่ยนอีเมล
          </Button>
        </Space>
      </div>
    )
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 'var(--space-4)' }} />}
      <Form.Item
        name="currentPassword"
        label="รหัสผ่านปัจจุบัน"
        rules={[{ required: true, message: 'กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันตัวตน' }]}
      >
        <Input.Password prefix={<LockOutlined />} autoComplete="current-password" disabled={isSubmitting} />
      </Form.Item>
      <Form.Item
        name="newEmail"
        label="อีเมลใหม่"
        rules={[
          {
            validator: (_, value: string) => {
              const msg = validateEmail(value ?? '')
              return msg ? Promise.reject(new Error(msg)) : Promise.resolve()
            },
          },
        ]}
      >
        <Input prefix={<MailOutlined />} type="email" autoComplete="email" disabled={isSubmitting} />
      </Form.Item>
      <Form.Item
        name="confirmEmail"
        label="ยืนยันอีเมลใหม่"
        dependencies={['newEmail']}
        rules={[
          ({ getFieldValue }) => ({
            validator: (_, value: string) =>
              !value || getFieldValue('newEmail') === value
                ? Promise.resolve()
                : Promise.reject(new Error('อีเมลไม่ตรงกัน')),
          }),
        ]}
      >
        <Input prefix={<MailOutlined />} type="email" autoComplete="email" disabled={isSubmitting} />
      </Form.Item>
      <Space>
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          บันทึกอีเมล
        </Button>
        <Button
          onClick={() => {
            form.resetFields()
            setError('')
            setIsEditing(false)
          }}
        >
          ยกเลิก
        </Button>
      </Space>
    </Form>
  )
}
