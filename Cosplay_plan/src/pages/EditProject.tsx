import { Alert, Typography } from 'antd'
import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useProject } from '../hooks/useProject'
import { useImageUpload } from '../hooks/useImageUpload'
import { useToast } from '../hooks/useToast'
import { toUserMessage } from '../utils/errors'
import ProjectForm from '../components/project/ProjectForm'
import PageContainer from '../components/common/PageContainer'
import PageState from '../components/common/PageState'

/**
 * EditProject — logic (useProject + submitLock + uploadImage) ไม่แตะ
 * render layer → ของกลาง: `PageContainer width="form"` + `PageState` (T3/T7)
 * ก่อน T7 เขียน `Result` 3 ชุดซ้ำกับ ProjectDetail
 */
export default function EditProject() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { project, loading, notFound, error: loadError, update } = useProject(id)
  const { uploadImage } = useImageUpload()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submitLock = useRef(false)

  const handleSubmit = async (data: {
    charName: string
    seriesName: string
    budget: number
    status: 'planning' | 'active' | 'waiting' | 'completed' | 'cancelled'
    note: string
    imageFile: File | null
    imageUrl: string
    items: { name: string; price: number; shopLink: string; category: string }[]
  }) => {
    if (!id) return
    if (submitLock.current) return
    submitLock.current = true
    setIsSubmitting(true)
    setError('')
    try {
      await update({
        charName: data.charName,
        seriesName: data.seriesName,
        budget: data.budget,
        status: data.status,
        note: data.note,
        items: data.items,
        // รูป: ถ้ามีไฟล์ใหม่ → ห้ามเขียน objectUrl (uploadImage จะเขียน URL จริงให้ทีหลัง)
        // ถ้าไม่มีไฟล์ใหม่ → ส่ง imageUrl ตรง ๆ ('' = ผู้ใช้กดล้างรูป → เคลียร์ใน Firestore)
        ...(data.imageFile ? {} : { imageUrl: data.imageUrl }),
      })

      // อัปโหลดรูปใหม่ถ้ามี — รูปพลาดไม่บล็อกการบันทึก (แจ้งเตือนแทน — A5)
      if (data.imageFile) {
        try {
          await uploadImage(data.imageFile, id)
        } catch (err) {
          console.error(err)
          addToast('error', `อัปโหลดรูปไม่สำเร็จ: ${toUserMessage(err)}`)
        }
      }

      navigate(`/projects/${id}`)
    } catch (err) {
      console.error(err)
      setError(toUserMessage(err))
      submitLock.current = false
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <PageState status="loading" />
  }

  if (loadError) {
    return <PageState status="error" title="โหลดข้อมูลไม่สำเร็จ" message={loadError} />
  }

  if (notFound || !project) {
    return <PageState status="notFound" />
  }

  return (
    <PageContainer width="form">
      <Typography.Title level={2} style={{ marginBottom: 'var(--space-6)' }}>
        แก้ไขโปรเจกต์: {project.charName}
      </Typography.Title>
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
      <ProjectForm
        initialData={project}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </PageContainer>
  )
}
