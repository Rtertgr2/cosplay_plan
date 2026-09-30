import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PictureOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import { Button, Card, Dropdown, Flex, Image, Progress, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { Project } from '../../services/projectService'
import { STATUS_LABELS, STATUS_TAG_COLOR } from '../../utils/constants'
import { formatCurrency, formatRelativeTime } from '../../utils/formatters'
import { isOverBudget, progressOf, spentOf } from '../../utils/projectProgress'
import { useToast } from '../../hooks/useToast'
import { toUserMessage } from '../../utils/errors'
import ConfirmDialog from '../common/ConfirmDialog'

interface ProjectCardProps {
  project: Project
  /** ลบผ่าน hook ของหน้า (optimistic — เอาออกจาก list ทันที) */
  onDelete: (id: string) => Promise<void>
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Task 5 — ความคืบหน้า/ยอดใช้จ่ายจริงคำนวณจากรายการที่ซื้อแล้ว
  const progress = progressOf(project.items)
  const spent = spentOf(project.items)
  const overBudget = isOverBudget(project.items, project.budget)

  const handleClick = () => {
    navigate(`/projects/${project.id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const confirmDelete = async () => {
    setShowDeleteConfirm(false)
    try {
      await onDelete(project.id)
      addToast('success', 'ลบโปรเจกต์แล้ว')
    } catch (err) {
      console.error(err)
      addToast('error', `ลบไม่สำเร็จ: ${toUserMessage(err)}`)
    }
  }

  // ConfirmDialog เป็น sibling นอก card (role="button") — ถ้าวางข้างใน
  // คลิกใน dialog จะ bubble ขึ้น card → navigate หนี dialog กลางทาง
  return (
    <>
      <Card
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        className="project-card"
        tabIndex={0}
        aria-label={`ดูรายละเอียด ${project.charName}`}
        hoverable
        cover={
          <div
            className="project-card-cover"
            style={{
              background: 'var(--surface-warm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
            }}
          >
            {project.imageUrl ? (
              <Image
                src={project.imageUrl}
                alt={`รูปประกอบ ${project.charName}`}
                preview={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <PictureOutlined style={{ fontSize: '2rem', color: 'var(--muted)' }} />
            )}
          </div>
        }
        styles={{
          body: {
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            flex: 1,
            minWidth: 0,
          },
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography.Title
            level={4}
            ellipsis
            style={{ margin: '0 0 var(--space-1)' }}
          >
            {project.charName}
          </Typography.Title>
          {project.seriesName && (
            <Typography.Text
              type="secondary"
              ellipsis
              style={{ display: 'block', marginBottom: 'var(--space-2)' }}
            >
              {project.seriesName}
            </Typography.Text>
          )}
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <Tag color={STATUS_TAG_COLOR[project.status]}>
              {STATUS_LABELS[project.status]}
            </Tag>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'var(--text-sm)',
            }}
          >
            <Typography.Text type="secondary">
              <ShoppingOutlined /> {project.items.length} รายการ
            </Typography.Text>
            <Typography.Text type="secondary">{formatCurrency(project.budget)}</Typography.Text>
          </div>
          {project.updatedAt && (
            <Typography.Text
              type="secondary"
              style={{ display: 'block', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}
            >
              อัปเดต {formatRelativeTime(project.updatedAt.toDate())}
            </Typography.Text>
          )}
        </div>

        {/* Progress + งบที่ใช้จริง (Task 5) */}
        <div style={{ marginTop: 'var(--space-2)' }}>
          <Flex justify="space-between" align="center" gap={8} style={{ marginBottom: 4 }}>
            <Typography.Text type="secondary" style={{ fontSize: 'var(--text-sm)' }}>
              ความคืบหน้า
            </Typography.Text>
            <Typography.Text style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
              {progress}%
            </Typography.Text>
          </Flex>
          <Progress
            percent={progress}
            showInfo={false}
            size="small"
            status={overBudget ? 'exception' : 'normal'}
          />
          <Flex
            justify="space-between"
            align="center"
            gap={8}
            style={{ marginTop: 'var(--space-2)' }}
          >
            <Typography.Text type="secondary" style={{ fontSize: 'var(--text-sm)' }}>
              {formatCurrency(spent)} / {formatCurrency(project.budget)}
            </Typography.Text>
            {overBudget && (
              <Tag color="error" style={{ marginInlineEnd: 0 }}>
                เกินงบ {formatCurrency(spent - project.budget)}
              </Tag>
            )}
          </Flex>
        </div>

        {/* เมนู ⋮ — คลิกแล้วห้ามนำไปหน้า detail (stopPropagation) */}
        <div
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'edit', icon: <EditOutlined />, label: 'แก้ไข' },
                { key: 'delete', icon: <DeleteOutlined />, label: 'ลบ', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'edit') navigate(`/projects/${project.id}/edit`)
                if (key === 'delete') setShowDeleteConfirm(true)
              },
            }}
          >
            <Button
              size="small"
              type="text"
              icon={<MoreOutlined />}
              aria-label="เมนูโปรเจกต์"
            />
          </Dropdown>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="ลบโปรเจกต์"
        message={`คุณต้องการลบ "${project.charName}" ใช่ไหม? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ลบ"
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}
