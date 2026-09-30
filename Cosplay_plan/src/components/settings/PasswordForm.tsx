import { LockOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Input, Space } from 'antd'
import { useRef, useState } from 'react'
import { validateConfirmPassword, validatePassword } from '../../utils/validation'

interface PasswordFormValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface PasswordFormProps {
  /** คืน error เป็นข้อความไทยให้หน้าแสดง (null = สำเร็จ) */
  onSubmit: (currentPassword: string, newPassword: string) => Promise<string | null>
  /** หลังเปลี่ยนสำเร็จ — หน้าแม่จะล็อกอินออกให้เข้าสู่ระบบใหม่ด้วยรหัสใหม่ */
  onSuccess: () => void | Promise<void>
}

/** เปลี่ยนรหัสผ่าน (Firebase Auth บังคับ re-auth ก่อน) */
export default function PasswordForm({ onSubmit, onSuccess }: PasswordFormProps) {
  const [form] = Form.useForm()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLock = useRef(false)

  const handleFinish = async (values: PasswordFormValues) => {
    if (submitLock.current) return
    submitLock.current = true
    setError('')
    setIsSubmitting(true)
    try {
      const message = await onSubmit(values.currentPassword, values.newPassword)
      if (message) {
        setError(message)
        return
      }
      form.resetFields()
      await onSuccess()
    } finally {
      submitLock.current = false
      setIsSubmitting(false)
    }
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
        name="newPassword"
        label="รหัสผ่านใหม่"
        rules={[
          {
            validator: (_, value: string) => {
              const msg = validatePassword(value ?? '')
              return msg ? Promise.reject(new Error(msg)) : Promise.resolve()
            },
          },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} autoComplete="new-password" disabled={isSubmitting} />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label="ยืนยันรหัสผ่านใหม่"
        dependencies={['newPassword']}
        rules={[
          ({ getFieldValue }) => ({
            validator: (_, value: string) => {
              const msg = validateConfirmPassword(getFieldValue('newPassword') ?? '', value ?? '')
              return msg ? Promise.reject(new Error(msg)) : Promise.resolve()
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} autoComplete="new-password" disabled={isSubmitting} />
      </Form.Item>
      <Space>
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          บันทึกรหัสผ่าน
        </Button>
      </Space>
    </Form>
  )
}
