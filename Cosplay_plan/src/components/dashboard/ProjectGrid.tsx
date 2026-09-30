import { Button, Col, Empty, Row } from 'antd'
import { Link } from 'react-router'
import type { Project } from '../../services/projectService'
import ProjectCard from './ProjectCard'

interface ProjectGridProps {
  projects: Project[]
  /** ลบผ่าน useProjects ของหน้า — optimistic remove จาก list */
  onDelete: (id: string) => Promise<void>
}

export default function ProjectGrid({ projects, onDelete }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <Empty description="ยังไม่มีโปรเจกต์">
        <Link to="/projects/new">
          <Button type="primary">โปรเจกต์ใหม่</Button>
        </Link>
      </Empty>
    )
  }

  return (
    <Row gutter={[16, 16]}>
      {projects.map((project) => (
        <Col key={project.id} xs={24} sm={12} lg={8}>
          <ProjectCard project={project} onDelete={onDelete} />
        </Col>
      ))}
    </Row>
  )
}
