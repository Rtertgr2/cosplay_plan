import { Button } from 'antd'
import { Link } from 'react-router'
import PageContainer from '../components/common/PageContainer'
import PageState from '../components/common/PageState'

/**
 * NotFound — custom 404 page (T35)
 * ข้อความ '404' + 'ไม่พบหน้านี้' คงเดิม (test NotFound.test.tsx คุ้มครอง — ห้ามแก้)
 */
export default function NotFound() {
  return (
    <PageContainer>
      <PageState
        status="404"
        title="404"
        description="ไม่พบหน้านี้ — ลิงก์อาจหมดอายุ หรือหน้าถูกลบไปแล้ว"
        action={
          <Link to="/">
            <Button type="primary">กลับหน้าหลัก</Button>
          </Link>
        }
      />
    </PageContainer>
  )
}
