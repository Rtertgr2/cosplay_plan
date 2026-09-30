import { Alert, Typography } from 'antd'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useProjects } from '../hooks/useProjects'
import { useImageUpload } from '../hooks/useImageUpload'
import { useToast } from '../hooks/useToast'
import { toUserMessage } from '../utils/errors'
import ProjectForm from '../components/project/ProjectForm'
import PageContainer from '../components/common/PageContainer'

export default function CreateProject() {
  const navigate = useNavigate()
  const { create } = useProjects({ autoFetch: false })
  const { uploadImage } = useImageUpload()
  const { addToast } = useToast()
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
    items: { name: string; price: number; shopLink: string; category: string }[]
  }) => {
    if (submitLock.current) return
    submitLock.current = true
    setIsSubmitting(true)
    setError('')
    try {
      const id = await create({
        charName: data.charName,
        seriesName: data.seriesName,
        budget: data.budget,
        status: data.status,
        note: data.note,
        items: data.items,
      })

      // อัปโหลดรูปถ้ามี — project สร้างสำเร็จแล้ว รูปพลาดห้ามเงียบ (A5): แจ้งให้ลองใหม่
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

  return (
    <PageContainer width="form">
      <Typography.Title level={2} style={{ marginBottom: 'var(--space-6)' }}>
        สร้างโปรเจกต์ใหม่
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
      <ProjectForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </PageContainer>
  )
}
