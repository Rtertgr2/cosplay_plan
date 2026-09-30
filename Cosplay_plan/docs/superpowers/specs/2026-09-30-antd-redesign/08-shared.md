# 08 — Shared components: ConfirmDialog / ErrorMessage / Loading / Toast

components เหล่านี้ใช้ร่วมกันทุกหน้า — **คงสัญญา props/API ทั้งหมด** ให้หน้าต่าง ๆ ไม่ต้องแก้เมื่อ swap internals

## `ConfirmDialog.tsx` → antd `Modal`

| เดิม | antd |
|---|---|
| `<Modal isOpen onClose ariaLabel>` + manual h2/p/ปุ่ม | **`<Modal open={isOpen} title={title} onOk={onConfirm} onCancel={onCancel} okText={confirmLabel} cancelText={cancelLabel} okButtonProps={{ danger: isDestructive }} centered>`** + `<Typography.Paragraph type="secondary">{message}</Paragraph>` |
| focus trap / Escape / restore focus manual (ใน `Modal.tsx` 120 บรรทัด) | **antd จัดเอง** — ลบ `common/Modal.tsx` (ไม่มี consumer อื่น) |
| props `{ isOpen, title, message, confirmLabel?, cancelLabel?, isDestructive?, onConfirm, onCancel }` | **คงเดิมทั้งหมด** (map `isOpen → open` ใน component เดียว) |

**ผู้ใช้**: ProjectCard (ลบ), ProjectDetail (ลบ) — ทั้งคู่ไม่ต้องแก้

## `ErrorMessage.tsx` → antd `Result` (หรือ Alert)

| เดิม | antd |
|---|---|
| div + ⚠️ + h3 + p + ปุ่มลองใหม่ | **`<Result status="error" title={title} subTitle={message} extra={onRetry && <Button type="primary" onClick={onRetry}>ลองใหม่</Button>}>`** |
| props `{ title?, message, onRetry? }` | คงเดิม |
| `role="alert"` | Result ไม่ได้ใส่ — เพิ่ม `role="alert"` ที่ wrapper div ถ้า antd ไม่ expose (verify) |

**ผู้ใช้**: Dashboard (error), EditProject (loadError — ถ้าเลือกใช้), (ProjectDetail ถ้าเลือก uniform)

## `Loading.tsx` → antd `Spin`

| เดิม | antd |
|---|---|
| div.spinner + p ข้อความ | **`<Flex align="center" justify="center" vertical gap={16} style={{ minHeight: 48, padding: 48 }}><Spin size="large" /><Typography.Text type="secondary">{message}</Typography.Text></Flex>`** |
| props `{ message? = 'กำลังโหลด...' }` | คง |
| `.spinner` keyframes (components.css) | ลบพร้อมไฟล์ (antd มี animation เอง) |
| `role="status" aria-live="polite"` | Spin มี `aria-live` — verify, ถ้าไม่มีคง wrapper เดิมใส่เอง |

## Toast → antd notification (สำคัญ — API ห้ามแตก)

### สัญญาที่ต้องคง
```ts
addToast('success' | 'error' | 'warning' | 'info', message: string): void
// auto-dismiss: success/info 3000ms, warning 5000ms, error 6000ms (คงค่าเดิม)
```
ผู้ใช้ `addToast` (ห้ามแก้หน้า): CreateProject, EditProject, ProjectDetail, ProjectCard, Header (logout error)

### การ implement ใหม่
| เดิม | antd |
|---|---|
| `ToastContext` + toasts array + timers + `ToastContainer` render list | **`ToastProvider` คงชื่อ/ API `useToast()` — ข้างในใช้ `AntdApp.useApp().notification`**: `notification[type === 'success' ? 'success' : …]({ message, duration: AUTO_DISMISS_MS[type], placement: 'topRight' })` |
| `components/common/Toast.tsx` (ToastContainer) | **ลบทั้งไฟล์** + ลบ `<ToastContainer />` จาก App.tsx (notification วาดตัวเอง) |
| close button manual | notification มีปุ่มปิดเอง |
| `role="alert"` สำหรับ error | notification ไม่ได้ใส่ — **verify**: ถ้า a11y ต้องการ คงกลไกเดิมโดยเพิ่ม `description` role หรือยอมรับ antd default (บันทึกการตัดสินใจใน PR/รายงาน) |

### ข้อบังคับโครงสร้าง
- `ToastProvider` ต้องอยู่ **ใต้ `<AntdApp>`** (ดู `00-overview` provider chain) — `useApp()` ต้องการ context
- ห้ามเรียก static `notification.xxx()` ตรง ๆ (v6: static ไม่เห็น theme/locale)
- `context/toast-context.ts` type `ToastContextValue` คง `{ toasts, addToast, removeToast }` — ถ้า `toasts`/`removeToast` ไม่มี consumer เหลือ (เช็กด้วย grep) → **ตัดออกเหลือ `{ addToast }`** เพื่อลด state ไร้ประโยชน์, อัปเดต type ให้ตรง (โค้เด compile บังคับ)

## ไฟล์ที่ถูกลบจากโฟลเดอร์นี้
- `common/Modal.tsx` — antd Modal แทน (focus/Escape/restore เดิม)
- `common/Toast.tsx` — notification แทน
