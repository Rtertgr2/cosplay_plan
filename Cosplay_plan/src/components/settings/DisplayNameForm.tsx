import { Alert, Button, Form, Input } from 'antd'
import { useRef, useState } from 'react'
import { UserOutlined } from '@ant-design/icons'

interface DisplayNameFormProps {
  /** ชื่อเดิมจาก Auth (null = ยังไม่ได้ตั้ง) */
  initialName: string | null
  /** คืน error เป็นข้อความไทยให้หน้าแสดง */
  onSubmit: (name: string) => Promise<string | null>
  onSuccess: (name: string) => void
}

/**
 * ฟอร์มเปลี่ยนชื่อที่แสดง (Firebase Auth profile — ไม่แตะ Firestore)
 * ส่งชื่อว่างได้ = ล้างชื่อ แล้ว Header จะตกไปใช้อีเมลแทน
 */
export default function DisplayNameForm({
  initialName,
  onSubmit,
  onSuccess,
}: DisplayNameFormProps) {
  const [form] = Form.useForm()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLock = useRef(false)

  const handleFinish = async (values: { displayName: string }) => {
    if (submitLock.current) return
    submitLock.current = true
    setError('')
    setIsSubmitting(true)
    try {
      const message = await onSubmit(values.displayName)
      if (message) {
        setError(message)
        return
      }
      const saved = values.displayName.trim()
      form.setFieldsValue({ displayName: saved })
      onSuccess(saved)
    } finally {
      submitLock.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ displayName: initialName ?? '' }}>
      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 'var(--space-4)' }} />}
      <Form.Item
        name="displayName"
        label="ชื่อที่แสดงในแอป"
        extra={initialName ? undefined : 'ยังไม่ได้ตั้งชื่อ — เว้นว่างไว้ได้ ระบบจะใช้อีเมลแทน'}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="เช่น เรม"
          maxLength={50}
          autoComplete="name"
          disabled={isSubmitting}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={isSubmitting}>
        บันทึกชื่อ
      </Button>
    </Form>
  )
}
