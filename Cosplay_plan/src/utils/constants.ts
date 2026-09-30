/**
 * Shared constants — ค่าคงที่ทั้งแอป
 * เก็บ emoji ไว้ใน constants (UI layer) ไม่ใช่ใน data
 */

// ─── Project Status ───────────────────────────────────────────────

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  WAITING: 'waiting',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS]

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  [PROJECT_STATUS.PLANNING]: '📋 วางแผนอยู่',
  [PROJECT_STATUS.ACTIVE]: '🔨 กำลังดำเนินการ',
  [PROJECT_STATUS.WAITING]: '⏳ กำลังรอของ',
  [PROJECT_STATUS.COMPLETED]: '✅ คอสเสร็จแล้ว',
  [PROJECT_STATUS.CANCELLED]: '❌ ยกเลิก',
}

export const STATUS_VALUES = Object.values(PROJECT_STATUS)

/** สี preset ของ antd Tag ตามสถานะ — export เดียวที่ Dashboard card + Detail ใช้ร่วมกัน */
export const STATUS_TAG_COLOR = {
  planning: 'blue',
  active: 'processing',
  waiting: 'gold',
  completed: 'success',
  cancelled: 'error',
} as const

// ─── Item Category ────────────────────────────────────────────────

export const ITEM_CATEGORIES = {
  WIG: 'วิก',
  COSTUME: 'ชุด',
  PROP: 'พร็อพ',
  SHOES: 'รองเท้า',
} as const

export type ItemCategory = (typeof ITEM_CATEGORIES)[keyof typeof ITEM_CATEGORIES]

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  [ITEM_CATEGORIES.WIG]: 'วิก',
  [ITEM_CATEGORIES.COSTUME]: 'ชุด',
  [ITEM_CATEGORIES.PROP]: 'พร็อพ',
  [ITEM_CATEGORIES.SHOES]: 'รองเท้า',
}

export const CATEGORY_VALUES = Object.values(ITEM_CATEGORIES)

// ─── Validation ───────────────────────────────────────────────────

export const VALIDATION = {
  MAX_IMAGE_SIZE_MB: 5,
  MAX_IMAGE_DIMENSION: 1200,
  IMAGE_QUALITY: 0.7,
  MAX_CHAR_NAME_LENGTH: 100,
  MAX_SERIES_NAME_LENGTH: 100,
  MAX_NOTE_LENGTH: 1000,
  MAX_ITEM_NAME_LENGTH: 100,
} as const

// ─── Firestore ───────────────────────────────────────────────────

export const FIRESTORE_COLLECTIONS = {
  PROJECTS: 'projects',
} as const
