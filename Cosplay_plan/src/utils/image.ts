import { VALIDATION } from './constants'

/**
 * Image processing — ย้ายจาก legacy (base64) มาเป็น Blob
 * resize ให้ด้านยาวสุด 1200px, บีบอัด JPEG 0.7
 * คืน Blob (ไม่ใช่ base64) เพื่ออัปโหลดไป Firebase Storage
 */

const MAX_DIMENSION = VALIDATION.MAX_IMAGE_DIMENSION
const QUALITY = VALIDATION.IMAGE_QUALITY

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'กรุณาเลือกไฟล์รูปภาพ'
  }
  // SVG เป็น XML scriptable — โฮสต์เป็น image/svg ก็สั่ง JS ได้ → ไม่รับ (ตรง storage.rules)
  if (file.type === 'image/svg+xml') {
    return 'ไม่รองรับไฟล์ SVG — กรุณาใช้ JPG, PNG หรือ WEBP'
  }
  const maxBytes = VALIDATION.MAX_IMAGE_SIZE_MB * 1024 * 1024
  if (file.size > maxBytes) {
    return `ไฟล์ใหญ่เกิน ${VALIDATION.MAX_IMAGE_SIZE_MB}MB`
  }
  return null
}

/**
 * ประมวลผลรูปภาพ: resize + บีบอัด → คืน Blob
 * ใช้ canvas API (browser only)
 */
export async function processImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // resize ให้ด้านยาวสุด MAX_DIMENSION
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width)
          width = MAX_DIMENSION
        } else {
          width = Math.round((width * MAX_DIMENSION) / height)
          height = MAX_DIMENSION
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('ไม่สามารถสร้าง canvas context ได้'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('ไม่สามารถแปลงรูปภาพได้'))
          }
        },
        'image/jpeg',
        QUALITY,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('ไม่สามารถโหลดรูปภาพได้'))
    }

    img.src = url
  })
}

/**
 * สร้างชื่อไฟล์สำหรับ Storage
 * รูปแบบ: {timestamp}-{sanitizedName}
 */
export function createStorageFilename(originalName: string): string {
  const timestamp = Date.now()
  const sanitized = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .slice(-50)
  return `${timestamp}-${sanitized}`
}
