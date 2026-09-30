import { DeleteOutlined, InboxOutlined, RetweetOutlined } from '@ant-design/icons'
import { Button, Image, Spin, Alert, Upload } from 'antd'
import { useEffect, useRef, useState, type DragEvent } from 'react'
import { processImage, validateImageFile } from '../../utils/image'
import { VALIDATION } from '../../utils/constants'

interface ImageUploaderProps {
  imageUrl: string
  onChange: (file: File | null, previewUrl: string) => void
}

type UploadState = 'empty' | 'selected' | 'error'

/**
 * ImageUploader — คงสัญญา props `{ imageUrl, onChange(file, previewUrl) }` + state model
 * (empty/selected/error, isDragging, isProcessing) + objectUrl revoke ทุกจุด
 * internal → antd Upload.Dragger (beforeUpload=false — จัดการเอง, ไม่ auto-upload)
 * โซน drop = wrapper ตัวเดิม (role/tabIndex/aria-label/คลิก/Enter เดิม) —
 * Dragger ตั้ง openFileDialogOnClick={false} กันเปิด file dialog ซ้ำ (click bubble ขึ้นมา)
 */
export default function ImageUploader({ imageUrl, onChange }: ImageUploaderProps) {
  const [preview, setPreview] = useState(imageUrl)
  const [state, setState] = useState<UploadState>(imageUrl ? 'selected' : 'empty')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // objectUrl ที่ component นี้สร้างเอง — revoke เมื่อแทนที่/ล้าง/unmount กัน leak
  const urlRef = useRef<string | null>(null)
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  const handleFile = async (file: File) => {
    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      setState('error')
      return
    }

    setError('')
    setIsProcessing(true)
    try {
      // resize 1200px + บีบอัด JPEG (T13) — ไม่ส่งไฟล์ต้นฉบับเข้า storage
      const blob = await processImage(file)
      const optimized = new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', {
        type: 'image/jpeg',
      })

      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      const objectUrl = URL.createObjectURL(optimized)
      urlRef.current = objectUrl
      setPreview(objectUrl)
      setState('selected')
      onChange(optimized, objectUrl)
    } catch {
      setError('ไม่สามารถประมวลผลรูปภาพได้')
      setState('error')
    } finally {
      setIsProcessing(false)
    }
  }

  // เปิด file picker (มีจุดเรียก 3 ทาง: คลิก / Enter / เปลี่ยนรูป)
  const openFilePicker = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) handleFile(file)
    }
    input.click()
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // ตอนมี Dragger (ยังไม่มี preview) — rc-upload จัดการ drop เองแล้ว (ผ่าน onChange)
    // ห้าม handleFile ซ้ำ (คู่ objectUrl จะ leak/ชนกัน) — เฉพาะตอนมี preview จึงรับเอง
    if (preview) {
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    }
  }

  const handleRemove = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setPreview('')
    setState('empty')
    setError('')
    onChange(null, '')
  }

  const handleReplace = () => {
    openFilePicker()
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6) var(--space-4)',
          textAlign: 'center',
          background: isDragging ? 'var(--surface-warm)' : 'transparent',
          transition: 'all var(--motion-fast)',
          cursor: 'pointer',
        }}
        onClick={() => {
          if (state === 'empty' || state === 'error') {
            openFilePicker()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="อัปโหลดรูปภาพ"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (state === 'empty' || state === 'error') {
              openFilePicker()
            }
          }
        }}
      >
        {preview ? (
          <div style={{ position: 'relative' }}>
            <Image
              src={preview}
              alt="รูป preview โปรเจกต์"
              preview={false}
              style={{
                display: 'block',
                maxHeight: '200px',
                margin: '0 auto',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
              styles={{
                image: { maxHeight: '200px', width: '100%', objectFit: 'cover' },
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                justifyContent: 'center',
                marginTop: 'var(--space-3)',
              }}
            >
              <Button
                size="small"
                icon={<RetweetOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleReplace()
                }}
              >
                เปลี่ยน
              </Button>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
              >
                ลบ
              </Button>
            </div>
          </div>
        ) : (
          <Upload.Dragger
            accept="image/*"
            maxCount={1}
            showUploadList={false}
            beforeUpload={() => false}
            openFileDialogOnClick={false}
            onChange={(info) => {
              const file = info.file.originFileObj
              if (file) handleFile(file)
            }}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              minHeight: 0,
              borderRadius: 0,
            }}
          >
            <div style={{ marginBottom: 'var(--space-2)', color: 'var(--muted)' }}>
              <InboxOutlined style={{ fontSize: '2rem' }} />
            </div>
            <div
              style={{
                color: 'var(--muted)',
                fontSize: 'var(--text-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
              }}
            >
              {isProcessing && <Spin size="small" />}
              <span>
                {isProcessing
                  ? 'กำลังประมวลผล...'
                  : isDragging
                    ? 'วางไฟล์ที่นี่'
                    : 'คลิกหรือลากไฟล์มาวาง'}
              </span>
            </div>
            <div
              style={{
                color: 'var(--muted)',
                fontSize: 'var(--text-xs)',
                marginTop: 'var(--space-1)',
              }}
            >
              JPG, PNG, WEBP (สูงสุด {VALIDATION.MAX_IMAGE_SIZE_MB}MB)
            </div>
          </Upload.Dragger>
        )}
      </div>
      {error && (
        <Alert
          type="error"
          showIcon
          closable={false}
          title={error}
          role="alert"
          style={{ marginTop: 'var(--space-2)' }}
        />
      )}
    </div>
  )
}
