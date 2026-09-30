import { Button, Card, Col, Form, Input, InputNumber, Row, Steps } from 'antd'
import { useState } from 'react'
import type { Project, ProjectItem } from '../../services/projectService'
import { PROJECT_STATUS, VALIDATION, type ProjectStatus } from '../../utils/constants'
import { validateProject } from '../../utils/validation'
import StatusSelect from './StatusSelect'
import ImageUploader from './ImageUploader'
import ItemForm from './ItemForm'
import ItemList from './ItemList'
import ProjectFormReview from './ProjectFormReview'

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

const STEP_LABELS = [
  'ข้อมูลพื้นฐาน',
  'รูปภาพ',
  'งบประมาณและสถานะ',
  'รายการวัสดุ',
  'ตรวจสอบ',
]

/** ฟิลด์ที่ต้องผ่าน validation ของแต่ละขั้น (เหมือนกันทั้ง Create/Edit) */
const STEP_FIELDS: (keyof FormValues)[][] = [
  ['charName', 'seriesName', 'note'],
  [],
  ['budget', 'status'],
  [],
  [],
]

const LAST_STEP = STEP_LABELS.length - 1

/**
 * ฟอร์มโปรเจกต์ 5 ขั้น (V5, สเปค §7) — ใช้ชุดเดียวกันทั้ง Create และ Edit
 * 1. ข้อมูลพื้นฐาน (ชื่อ/ซีรีส์/หมายเหตุ) 2. รูปภาพ 3. งบ+สถานะ 4. รายการวัสดุ 5. ตรวจสอบ
 *
 * - ทุกขั้นใช้ `Form` เดียวกัน → ค่าไม่หายเมื่อสลับขั้น
 * - ปุ่ม "ถัดไป" validate เฉพาะฟิลด์ของขั้นนั้น (ไม่ error ของขั้นอื่นรบกวน)
 * - Validation ขั้นสุดท้ายยังใช้ `validateProject()` จาก validation.ts (มาตรฐานเดียว)
 */
export default function ProjectForm({ initialData, onSubmit, isSubmitting }: ProjectFormProps) {
  const [form] = Form.useForm<FormValues>()
  const [step, setStep] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '')
  const [items, setItems] = useState<ProjectItem[]>(initialData?.items ?? [])

  // ติดตามค่าฟอร์มสด ๆ เพื่อให้ขั้น "ตรวจสอบ" สรุปตรงกับที่กรอก
  const watched = Form.useWatch([], form) as Partial<FormValues> | undefined

  const goNext = async () => {
    const fields = STEP_FIELDS[step]
    if (fields.length > 0) {
      try {
        await form.validateFields(fields)
      } catch {
        return // antd แสดง error ใต้ช่องให้แล้ว
      }
    }
    setStep((prev) => Math.min(prev + 1, LAST_STEP))
  }

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
      setStep(0)
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

  const goBack = () => setStep((prev) => Math.max(prev - 1, 0))

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
      <Steps
        current={step}
        items={STEP_LABELS.map((title) => ({ title }))}
        responsive
        size="small"
      />


      {/* ── ขั้น ① ข้อมูลพื้นฐาน ── */}
      {step === 0 && (
        <Card className="ui-section" variant="borderless" title="ตัวละคร">
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
          <Form.Item name="note" label="บันทึกย่อ" style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}>
            <Input.TextArea
              rows={3}
              autoSize={{ minRows: 3, maxRows: 6 }}
              disabled={isSubmitting}
              style={{ resize: 'vertical' }}
            />
          </Form.Item>
        </Card>
      )}

      {/* ── ขั้น ② รูปภาพ ── */}
      {step === 1 && (
        <Card className="ui-section" variant="borderless" title="รูปภาพ">
          <ImageUploader
            imageUrl={imageUrl}
            onChange={(file, url) => {
              setImageFile(file)
              setImageUrl(url)
            }}
          />
        </Card>
      )}

      {/* ── ขั้น ③ งบประมาณ + สถานะ ── */}
      {step === 2 && (
        <Card className="ui-section" variant="borderless" title="งบประมาณ & สถานะ">
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
      )}

      {/* ── ขั้น ④ รายการวัสดุ ── */}
      {step === 3 && (
        <Card className="ui-section" variant="borderless" title="รายการสินค้า">
          <ItemForm onAdd={(item) => setItems((prev) => [...prev, item])} />
          <div style={{ marginTop: 'var(--space-2)' }}>
            <ItemList
              items={items}
              onRemove={(i) => setItems((prev) => prev.filter((_, idx) => idx !== i))}
            />
          </div>
        </Card>
      )}

      {/* ── ขั้น ⑤ ตรวจสอบ ── */}
      {step === 4 && (
        <ProjectFormReview
          values={{
            charName: watched?.charName ?? initialData?.charName ?? '',
            seriesName: watched?.seriesName ?? initialData?.seriesName ?? '',
            note: watched?.note ?? initialData?.note ?? '',
            budget: Number(watched?.budget ?? initialData?.budget ?? 0),
            status: (watched?.status ?? initialData?.status ?? PROJECT_STATUS.PLANNING) as ProjectStatus,
          }}
          items={items}
          imageUrl={imageUrl}
          onEditStep={setStep}
        />
      )}

      {/* ── ปุ่มนำทาง ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <Button onClick={goBack} disabled={step === 0 || isSubmitting}>
          ย้อนกลับ
        </Button>

        {step < LAST_STEP ? (
          <Button type="primary" onClick={goNext} disabled={isSubmitting}>
            ถัดไป
          </Button>
        ) : (
          <Button type="primary" htmlType="submit" size="large" loading={isSubmitting}>
            {isSubmitting
              ? 'กำลังบันทึก...'
              : initialData
                ? 'บันทึกการแก้ไข'
                : 'สร้างโปรเจกต์'}
          </Button>
        )}
      </div>
    </Form>
  )
}

