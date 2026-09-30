/**
 * Formatters — ตัวช่วยจัดรูปแบบค่าต่าง ๆ
 */

/** จัดรูปแบบวันที่เป็นภาษาไทย */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** จัดรูปแบบเวลาเป็นภาษาไทย */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** จัดรูปแบบวันที่ + เวลา */
export function formatDateTime(date: Date | string | number): string {
  return `${formatDate(date)} ${formatTime(date)}`
}

/** จัดรูปแบบเงินบาท */
export function formatCurrency(value: number): string {
  return `฿${Number(value).toLocaleString('th-TH')}`
}

/** จัดรูปแบบเวลาที่ผ่านมา (relative time) */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'เมื่อสักครู่'
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`
  if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`
  if (diffDay < 7) return `${diffDay} วันที่แล้ว`
  return formatDate(date)
}
