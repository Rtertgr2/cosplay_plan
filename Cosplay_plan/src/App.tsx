import { App as AntdApp, ConfigProvider } from 'antd'
import thTH from 'antd/locale/th_TH'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { ThemeContextProvider } from './context/ThemeContext'
import { useTheme } from './hooks/useTheme'
import { createAntdTheme } from './theme/antdTheme'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import PageState from './components/common/PageState'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import PublicLayout from './components/layout/PublicLayout'
import AuthLayout from './components/layout/AuthLayout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
const Projects = lazy(() => import('./pages/Projects'))
const CreateProject = lazy(() => import('./pages/CreateProject'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const EditProject = lazy(() => import('./pages/EditProject'))
import Login from './pages/Login'
import Register from './pages/Register'
const Settings = lazy(() => import('./pages/Settings'))
import NotFound from './pages/NotFound'

/**
 * App root — โครง route แบบ layout route (T6)
 * - `/` → PublicLayout (Landing สาธารณะ)
 * - `/login`, `/register` → AuthLayout (แถบบาง ไม่มีเมนู — ผู้ยังไม่ login ไม่ต้องเห็นเมนูแอป)
 * - หน้าอื่น → ProtectedRoute (ครอบครั้งเดียว) → AppLayout (header + sidebar + mobile nav)
 * - 404 → ยังอยู่ใต้ AppLayout (ผู้ที่ล็อกอินแล้วเจอลิงก์เสีย ยังเห็นเมนูนำทาง) = พฤติกรรมเดิม
 *
 * Provider chain (ลำดับสำคัญ): ThemeContextProvider > ConfigProvider(ธีม antd + locale ไทย)
 * > AntdApp (ให้ static methods เห็น context) > AuthProvider > ToastProvider > BrowserRouter
 * > ErrorBoundary (กันหน้าขาวเมื่อ component พังตอน render)
 */
function App() {
  return (
    <ThemeContextProvider>
      <AntdShell />
    </ThemeContextProvider>
  )
}

function AntdShell() {
  const { theme } = useTheme()

  return (
    <ConfigProvider locale={thTH} theme={createAntdTheme(theme)}>
      <AntdApp>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <Suspense fallback={<PageState status="loading" />}>
                <Routes>
                  {/* สาธารณะ — ยังไม่ต้อง login */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Landing />} />
                  </Route>

                  {/* ยังไม่ login — ไม่มีเมนูแอป */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Route>

                  {/* ต้อง login — ครอบครั้งเดียว แล้วเข้า AppLayout */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/new" element={<CreateProject />} />
                      <Route path="/projects/:id" element={<ProjectDetail />} />
                      <Route path="/projects/:id/edit" element={<EditProject />} />
                      <Route path="/settings" element={<Settings />} />
                    </Route>
                  </Route>

                  {/* 404 */}
                  <Route element={<AppLayout />}>
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
