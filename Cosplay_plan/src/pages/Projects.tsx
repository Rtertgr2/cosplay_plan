import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useProjects } from '../hooks/useProjects'
import { filterProjects } from '../utils/projectFilters'
import type { Project } from '../services/projectService'
import SearchBar from '../components/dashboard/SearchBar'
import StatusFilter from '../components/dashboard/StatusFilter'
import ProjectGrid from '../components/dashboard/ProjectGrid'
import PageContainer from '../components/common/PageContainer'
import PageHeader from '../components/common/PageHeader'
import PageSkeleton from '../components/common/PageSkeleton'
import PageState from '../components/common/PageState'

function byUpdatedDesc(a: Project, b: Project): number {
  return b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime()
}

/**
 * /projects — My Projects (Task 4, สเปค §5.4)
 * หน้ารายการเต็ม: ค้นหา + กรอง + เรียงใหม่สุดก่อน (ช่องค้นหาย้ายมาจาก Dashboard)
 */
export default function Projects() {
  const { projects, loading, error, refresh, remove } = useProjects()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filtered = useMemo(() => {
    const matched = filterProjects(projects, { search, status })
    return [...matched].sort(byUpdatedDesc)
  }, [projects, search, status])

  if (loading) {
    return <PageSkeleton variant="cards" />
  }

  if (error) {
    return <PageState status="error" message={error} onRetry={refresh} />
  }

  return (
    <PageContainer>
      <PageHeader
        title="โปรเจกต์ของฉัน"
        action={
          <Link to="/projects/new">
            <Button type="primary" icon={<PlusOutlined />}>
              สร้างโปรเจกต์
            </Button>
          </Link>
        }
      />

      <Card className="dashboard-filters" variant="borderless" styles={{ body: { padding: 0 } }}>
        <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 12 }}>
          <div>
            <Typography.Text strong>ค้นหาโปรเจกต์</Typography.Text>
            <Typography.Text type="secondary" style={{ display: 'block', fontSize: 'var(--text-sm)' }}>
              ค้นหาตามชื่อตัวละครหรือซีรีส์
            </Typography.Text>
          </div>
        </Flex>
        <Flex gap={12} wrap align="center">
          <div style={{ flex: 1, minWidth: '220px' }}>
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <StatusFilter value={status} onChange={setStatus} />
        </Flex>
      </Card>

      <Typography.Text type="secondary" style={{ display: 'block', margin: 'var(--space-4) 0' }}>
        ทั้งหมด {filtered.length} โปรเจกต์
      </Typography.Text>

      <ProjectGrid projects={filtered} onDelete={remove} />
    </PageContainer>
  )
}
