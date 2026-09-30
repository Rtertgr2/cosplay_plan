import { Modal, Typography } from 'antd'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={isOpen}
      title={title}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmLabel}
      cancelText={cancelLabel}
      okButtonProps={{ danger: isDestructive }}
      centered
      width={400}
    >
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        {message}
      </Typography.Paragraph>
    </Modal>
  )
}
