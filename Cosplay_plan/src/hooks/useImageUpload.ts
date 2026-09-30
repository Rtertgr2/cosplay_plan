import { useCallback, useState } from 'react'
import { useAuth } from './useAuth'
import { uploadProjectImage } from '../services/storageService'
import { updateProject } from '../services/projectService'

interface UseImageUploadResult {
  uploadImage: (file: File, projectId: string) => Promise<string>
  uploading: boolean
}

/**
 * useImageUpload — อัปโหลดรูปโปรเจกต์แล้วอัปเดต imageUrl ให้อัตโนมัติ
 *
 * A4: ดึง uid จาก useAuth() เท่านั้น — ไม่มีทางส่ง uid ว่างเข้า path
 * (ขว้าง error ถ้าเรียกก่อน login)
 */
export function useImageUpload(): UseImageUploadResult {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)

  const uploadImage = useCallback(
    async (file: File, projectId: string): Promise<string> => {
      if (!user) {
        throw new Error('ต้องเข้าสู่ระบบก่อนอัปโหลดไฟล์')
      }
      setUploading(true)
      try {
        const url = await uploadProjectImage(file, projectId)
        await updateProject(projectId, { imageUrl: url })
        return url
      } finally {
        setUploading(false)
      }
    },
    [user],
  )

  return { uploadImage, uploading }
}
