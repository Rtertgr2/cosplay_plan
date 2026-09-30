import { PlusOutlined } from '@ant-design/icons'
import { Button, Flex, Typography } from 'antd'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import { calculateStats } from '../utils/projectStats'
import { formatRelativeTime } from '../utils/formatters'
import type { Project } from '../services/projectService'
import StatsCards from '../components/dashboard/StatsCards'
import ProjectGrid from '../components/dashboard/ProjectGrid'
import PageContainer from '../components/common/PageContainer'
import PageSkeleton from '../components/common/PageSkeleton'
import PageState from '../components/common/PageState'

const RECENT_LIMIT = 6
const ACTIVITY_LIMIT = 5

/** ใหม่สุดขึ้นก่อน — ใช้ร่วมกับหน้า /projects */
function byUpdatedDesc(a: Project, b: Project): number {
  return b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime()
}

function greetingFor(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) return 'สวัสดิตอนเช้า'
  if (hour < 17) return 'สวัสดีตอนบ่าย'
  return 'สวัสดิตอนเย็น'
}

/**
 * Dashboard = personal workspace (Task 4, สเปค §5.1)
 * โฟกัส "ภาพรวม": ทัก + ทำอะไรต่อ + สถิติ + 6 ล่าสุด + กิจกรรมล่าสุด
 * ช่องค้นหา/ตัวกรองย้ายไปหน้า /projects (ไม่ซ้ำสองหน้า)
 */
export default function Dashboard() {
  const { projects, loading, error, refresh, remove } = useProjects()
  const { displayName, user } = useAuth()

  const stats = useMemo(() => calculateStats(projects), [projects])
  const recent = useMemo(
    () => [...projects].sort(byUpdatedDesc).slice(0, RECENT_LIMIT),
    [projects],
  )

  if (loading) {
    return <PageSkeleton variant="cards" />
  }

  if (error) {
    return <PageState status="error" message={error} onRetry={refresh} />
  }

  const name = displayName ?? user?.email ?? ''

  return (
    <PageContainer>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Typography.Title level={1} style={{ marginBottom: 'var(--space-2)' }}>
          {greetingFor(new Date())} {name} 👋
        </Typography.Title>
        <Typography.Text type="secondary">
          วางแผนคอสเพลย์ตัวต่อไปของคุณ
        </Typography.Text>
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Link to="/projects/new">
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              สร้างโปรเจกต์
            </Button>
          </Link>
        </div>
      </div>

      <StatsCards stats={stats} />

      <Flex
        justify="space-between"
        align="center"
        gap={16}
        style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          โปรเจกต์ของคุณ
        </Typography.Title>
        <Link to="/projects">ดูทั้งหมด →</Link>
      </Flex>
      <ProjectGrid projects={recent} onDelete={remove} />

      <section style={{ marginTop: 'var(--space-8)' }}>
        <Typography.Title level={4} style={{ marginBottom: 'var(--space-3)' }}>
          กิจกรรมล่าสุด
        </Typography.Title>
        {recent.length === 0 ? (
          <Typography.Text type="secondary">ยังไม่มีกิจกรรม</Typography.Text>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', color: 'var(--muted)' }}>
            {recent.slice(0, ACTIVITY_LIMIT).map((project) => (
              <li key={project.id}>
                อัปเดต {project.charName} · {formatRelativeTime(project.updatedAt.toDate())}
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageContainer>
  )
}
