import { App as AntdApp, ConfigProvider } from 'antd'
import thTH from 'antd/locale/th_TH'
import { BrowserRouter, Route, Routes } from 'react-router'
import { ThemeContextProvider } from './context/ThemeContext'
import { useTheme } from './hooks/useTheme'
import { createAntdTheme } from './theme/antdTheme'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import AuthLayout from './components/layout/AuthLayout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import CreateProject from './pages/CreateProject'
import ProjectDetail from './pages/ProjectDetail'
import EditProject from './pages/EditProject'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

/**
 * App root — โครง route แบบ layout route (T6)
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
                <Routes>
                  {/* ยังไม่ login — ไม่มีเมนูแอป */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Route>

                  {/* ต้อง login — ครอบครั้งเดียว แล้วเข้า AppLayout */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<Dashboard />} />
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
              </ErrorBoundary>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
