import {
  ArrowLeftOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ShoppingOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Button, Flex, Progress, Space, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useProject } from '../hooks/useProject'
import { useToast } from '../hooks/useToast'
import { toUserMessage } from '../utils/errors'
import { formatCurrency } from '../utils/formatters'
import { copyText } from '../utils/clipboard'
import { isOverBudget, progressOf, spentOf } from '../utils/projectProgress'
import { toggleDoneAt } from '../utils/projectItems'
import ProjectHero from '../components/project/ProjectHero'
import ProjectStatus from '../components/project/ProjectStatus'
import ProjectNote from '../components/project/ProjectNote'
import ProjectItems from '../components/project/ProjectItems'
import ConfirmDialog from '../components/common/ConfirmDialog'
import PageContainer from '../components/common/PageContainer'
import PageState from '../components/common/PageState'

/**
 * Project Detail = หน้า showcase (Task 6, สเปค §5.3)
 * - state + handleDelete เดิมไม่แตะ
 * - progress/งบคำนวณจากรายการที่ซื้อแล้ว (Task 2)
 * - รายการ: ติ๊ก "ซื้อแล้ว" ได้ + ปุ่มไปร้านค้า (เปิดแท็บใหม่)
 * - ปุ่ม "กลับ" → `/projects` (ไม่พึ่งประวัติเบราว์เซอร์)
 */
export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { project, loading, notFound, error, remove, update } = useProject(id)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    setShowDeleteConfirm(false)
    try {
      await remove()
      navigate('/')
    } catch (err) {
      console.error(err)
      addToast('error', `ลบไม่สำเร็จ: ${toUserMessage(err)}`)
    }
  }

  if (loading) {
    return <PageState status="loading" />
  }

  if (error) {
    return <PageState status="error" title="โหลดข้อมูลไม่สำเร็จ" message={error} />
  }

  if (notFound || !project) {
    return <PageState status="notFound" />
  }

  const progress = progressOf(project.items)
  const spent = spentOf(project.items)
  const overBudget = isOverBudget(project.items, project.budget)

  return (
    <PageContainer>
      {/* Actions */}
      <Space wrap style={{ marginBottom: 'var(--space-6)' }}>
        <Button href="/projects" icon={<ArrowLeftOutlined />}>
          กลับ
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/projects/${project.id}/edit`)}
        >
          แก้ไข
        </Button>
        <Button
          icon={<CopyOutlined />}
          onClick={async () => {
            const ok = await copyText(`${window.location.origin}/projects/${project.id}`)
            addToast(
              ok ? 'success' : 'error',
              ok
                ? 'คัดลอกลิงก์แล้ว'
                : 'คัดลอกไม่สำเร็จ — กรุณาคัดลอกลิงก์จากแถบเบราว์เซอร์',
            )
          }}
        >
          คัดลอกลิงก์
        </Button>
        <Button danger icon={<DeleteOutlined />} onClick={() => setShowDeleteConfirm(true)}>
          ลบ
        </Button>
      </Space>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="ลบโปรเจกต์"
        message={`คุณต้องการลบ "${project.charName}" ใช่ไหม? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ลบ"
        cancelLabel="ยกเลิก"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Hero Image */}
      <ProjectHero imageUrl={project.imageUrl} charName={project.charName} />

      {/* เนื้อหา: จำกัดคอลัมน์ให้อ่านสบายตา (เท่าคอลัมน์ฟอร์ม) */}
      <div className="ui-section" style={{ maxWidth: 'var(--container-form)' }}>
        {/* Character & Series */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Typography.Title level={2} style={{ marginBottom: 'var(--space-2)' }}>
            {project.charName}
          </Typography.Title>
          {project.seriesName && (
            <Typography.Text
              type="secondary"
              style={{ display: 'block', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}
            >
              {project.seriesName}
            </Typography.Text>
          )}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <ProjectStatus status={project.status} />
          </div>
          <Flex gap="large" style={{ fontSize: 'var(--text-base)', color: 'var(--muted)' }}>
            <span>
              <WalletOutlined /> {formatCurrency(project.budget)}
            </span>
            <span>
              <ShoppingOutlined /> {project.items.length} รายการ
            </span>
          </Flex>
        </div>

        {/* Progress + งบที่ใช้จริง (Task 6) */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Flex justify="space-between" align="center" gap={8} style={{ marginBottom: 4 }}>
            <Typography.Text type="secondary">ความคืบหน้า</Typography.Text>
            <Typography.Text strong>{progress}%</Typography.Text>
          </Flex>
          <Progress
            percent={progress}
            showInfo={false}
            status={overBudget ? 'exception' : 'normal'}
          />
          <Flex
            justify="space-between"
            align="center"
            gap={8}
            style={{ marginTop: 'var(--space-3)' }}
          >
            <Typography.Text type="secondary">งบประมาณ</Typography.Text>
            <Typography.Text>
              {formatCurrency(spent)} / {formatCurrency(project.budget)}
            </Typography.Text>
          </Flex>
          {overBudget && (
            <Typography.Text type="danger" style={{ fontSize: 'var(--text-sm)' }}>
              ใช้จ่ายเกินงบ {formatCurrency(spent - project.budget)}
            </Typography.Text>
          )}
        </div>

        {/* Note */}
        <ProjectNote note={project.note} />

        {/* Items — ติ๊กซื้อแล้วได้ (Task 6) */}
        <ProjectItems
          items={project.items}
          onToggleDone={(index) => {
            update({ items: toggleDoneAt(project.items, index) })
              .then(() => addToast('success', 'อัปเดตรายการแล้ว'))
              .catch((err) => {
                console.error(err)
                addToast('error', `อัปเดตไม่สำเร็จ: ${toUserMessage(err)}`)
              })
          }}
        />
      </div>
    </PageContainer>
  )
}
