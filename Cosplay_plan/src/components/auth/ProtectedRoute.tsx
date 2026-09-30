import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import PageSkeleton from '../common/PageSkeleton'

/**
 * ProtectedRoute (T6) — layout route: ครอบทุกหน้าที่ต้อง login ครั้งเดียวผ่าน `<Outlet />`
 * ก่อน T6 ครอบซ้ำ 4 จุดใน App.tsx (`<ProtectedRoute><Page/></ProtectedRoute>`)
 * - loading → แสดงสถานะกำลังโหลด
 * - !user → redirect ไป /login (พร้อมจำ path เดิม)
 * - user → render เส้นทางถัดไป
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageSkeleton variant="auth" />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
