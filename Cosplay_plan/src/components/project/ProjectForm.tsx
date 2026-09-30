import { Button, Card, Col, Flex, Form, Input, InputNumber, Row } from 'antd'
import { useState } from 'react'
import type { Project, ProjectItem } from '../../services/projectService'
import { PROJECT_STATUS, VALIDATION, type ProjectStatus } from '../../utils/constants'
import { validateProject } from '../../utils/validation'
import StatusSelect from './StatusSelect'
import ImageUploader from './ImageUploader'
import ItemForm from './ItemForm'
import ItemList from './ItemList'

interface ProjectFormProps {
  initialData?: Project
  onSubmit: (data: {
    charName: string
    seriesName: string
    budget: number
    status: ProjectStatus
    note: string
    imageFile: File | null
    imageUrl: string
    items: ProjectItem[]
  }) => Promise<void>
  isSubmitting: boolean
}

interface FormValues {
  charName: string
  seriesName: string
  budget: number | null
  status: ProjectStatus
  note: string
}

/**
 * ฟอร์มโปรเจกต์ — antd Form (layout vertical)
 * Validation = validateProject() จาก validation.ts ที่เดียว (onFinish → setFields)
 * — ไม่เขียน rules ซ้ำ กันข้อความสองมาตรฐาน (spec03)
 * สัญญา props `onSubmit` / `isSubmitting` / `initialData` คงเดิม (CreateProject/EditProject พึ่งพา)
 */
export default function ProjectForm({
  initialData,
  onSubmit,
  isSubmitting,
}: ProjectFormProps) {
  const [form] = Form.useForm<FormValues>()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '')
  const [items, setItems] = useState<ProjectItem[]>(initialData?.items ?? [])

  const handleFinish = async (values: FormValues) => {
    const newErrors = validateProject({
      charName: values.charName,
      budget: values.budget ?? undefined,
      status: values.status,
    })
    if (Object.keys(newErrors).length > 0) {
      form.setFields(
        Object.entries(newErrors).map(([name, msg]) => ({
          name: name as keyof FormValues,
          errors: [msg],
        })),
      )
      return
    }

    await onSubmit({
      charName: values.charName.trim(),
      seriesName: values.seriesName.trim(),
      budget: Number(values.budget) || 0,
      status: values.status,
      note: values.note.trim(),
      imageFile,
      imageUrl,
      items,
    })
  }

  return (
    <Form
      form={form}
      layout="vertical"
      noValidate
      onFinish={handleFinish}
      disabled={isSubmitting}
      initialValues={{
        charName: initialData?.charName ?? '',
        seriesName: initialData?.seriesName ?? '',
        budget: initialData?.budget ?? null,
        status: initialData?.status ?? PROJECT_STATUS.PLANNING,
        note: initialData?.note ?? '',
      }}
      style={{ display: 'grid', gap: 'var(--space-6)' }}
    >
      {/* Character Section */}
      <Card className="ui-section" bordered={false} title="ตัวละคร">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="charName"
              label="ชื่อตัวละคร"
              required
              style={{ marginBottom: 0 }}
            >
              <Input
                maxLength={VALIDATION.MAX_CHAR_NAME_LENGTH}
                placeholder="เช่น Rem"
                disabled={isSubmitting}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="seriesName" label="ชื่อซีรีส์" style={{ marginBottom: 0 }}>
              <Input placeholder="เช่น Re:Zero" disabled={isSubmitting} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Image Section */}
      <Card className="ui-section" bordered={false} title="รูปภาพ">
        <ImageUploader
          imageUrl={imageUrl}
          onChange={(file, url) => {
            setImageFile(file)
            setImageUrl(url)
          }}
        />
      </Card>

      {/* Budget & Status Section */}
      <Card className="ui-section" bordered={false} title="งบประมาณ & สถานะ">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="budget" label="งบประมาณ" style={{ marginBottom: 0 }}>
              <InputNumber
                min={0}
                prefix="฿"
                style={{ width: '100%' }}
                disabled={isSubmitting}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="status" label="สถานะ" style={{ marginBottom: 0 }}>
              <StatusSelect disabled={isSubmitting} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Items Section */}
      <Card className="ui-section" bordered={false} title="รายการสินค้า">
        <ItemForm onAdd={(item) => setItems((prev) => [...prev, item])} />
        <div style={{ marginTop: 'var(--space-2)' }}>
          <ItemList
            items={items}
            onRemove={(i) => setItems((prev) => prev.filter((_, idx) => idx !== i))}
          />
        </div>
      </Card>

      {/* Note Section */}
      <Card className="ui-section" bordered={false} title="บันทึกย่อ">
        <Form.Item name="note" style={{ marginBottom: 0 }}>
          <Input.TextArea
            rows={3}
            autoSize={{ minRows: 3, maxRows: 6 }}
            disabled={isSubmitting}
            style={{ resize: 'vertical' }}
          />
        </Form.Item>
      </Card>

      {/* Actions */}
      <div
        style={{
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <Flex justify="flex-end" gap={12}>
          <Button type="primary" htmlType="submit" size="large" loading={isSubmitting}>
            {isSubmitting
              ? 'กำลังบันทึก...'
              : initialData
                ? 'บันทึกการแก้ไข'
                : 'สร้างโปรเจกต์'}
          </Button>
        </Flex>
      </div>
    </Form>
  )
}
