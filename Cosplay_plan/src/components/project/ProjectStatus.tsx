import { Tag } from 'antd'
import { STATUS_LABELS, STATUS_TAG_COLOR, type ProjectStatus } from '../../utils/constants'

export default function ProjectStatus({ status }: { status: ProjectStatus }) {
  return <Tag color={STATUS_TAG_COLOR[status]}>{STATUS_LABELS[status]}</Tag>
}
