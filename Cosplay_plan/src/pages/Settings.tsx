import { Card, Typography } from 'antd'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { authErrorMessage } from '../utils/authErrors'
import PageContainer from '../components/common/PageContainer'
import PageHeader from '../components/common/PageHeader'
import DisplayNameForm from '../components/settings/DisplayNameForm'
import EmailForm from '../components/settings/EmailForm'
import PasswordForm from '../components/settings/PasswordForm'

/**
 * ตั้งค่าบัญชี — ชื่อที่แสดง / อีเมล / รหัสผ่าน
 *
 * ทั้งหมดไปที่ Firebase Auth profile เท่านั้น → **ไม่มี Firestore, ไม่ต้องแตะ firestore.rules**
 * (ผู้ใช้เดิมที่ไม่มี displayName จะเห็นอีเมลแทนชื่อในแถบบนจนกว่าจะตั้งค่า)
 *
 * ทุกฟอร์มได้รับ `onSubmit` ที่ **คืนข้อความ error เป็นภาษาไทย** (หรือ null = สำเร็จ)
 * → ฟอร์มแสดง Alert เอง ไม่ต้อง try/catch ซ้ำ ๆ ในหน้า
 */
export default function Settings() {
  const { user, displayName, updateDisplayName, changeEmail, changePassword, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleDisplayName = async (name: string): Promise<string | null> => {
    try {
      await updateDisplayName(name)
      return null
    } catch (err) {
      console.error(err)
      return authErrorMessage(err, 'บันทึกชื่อไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  const handleEmail = async (currentPassword: string, newEmail: string): Promise<string | null> => {
    try {
      await changeEmail(currentPassword, newEmail)
      return null
    } catch (err) {
      console.error(err)
      return authErrorMessage(err, 'เปลี่ยนอีเมลไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  const handlePassword = async (currentPassword: string, newPassword: string): Promise<string | null> => {
    try {
      await changePassword(currentPassword, newPassword)
      return null
    } catch (err) {
      console.error(err)
      return authErrorMessage(err, 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  // ล้างชื่อ = ส่งค่าว่าง → Header จะตกไปใช้อีเมลแทน
  const handleNameSuccess = (name: string) => {
    addToast('success', name ? 'บันทึกชื่อแล้ว' : 'ล้างชื่อแล้ว — จะแสดงอีเมลแทน')
  }

  // เปลี่ยนรหัสผ่านสำเร็จ → บังคับเข้าสู่ระบบใหม่ด้วยรหัสใหม่ (ปิด session เก่าทิ้ง)
  const handlePasswordSuccess = async () => {
    addToast('success', 'เปลี่ยนรหัสผ่านแล้ว — กรุณาเข้าสู่ระบบใหม่')
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <PageContainer>
      {/* คอลัมน์เดียว จัดกึ่งกลาง + เว้นระยะระหว่างกล่องทั้ง 3 ด้วย gap จุดเดียว
          (ถ้าใช้ margin ซ้อน ๆ การ์ดจะติดกันและหน้าจะชิดซ้าย) */}
      <div
        style={{
          maxWidth: 'var(--container-form)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        <PageHeader title="ตั้งค่าบัญชี" />

        <div className="ui-section">
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            ชื่อที่แสดง
          </Typography.Title>
          <DisplayNameForm
            initialName={displayName}
            onSubmit={handleDisplayName}
            onSuccess={handleNameSuccess}
          />
        </div>

        <div className="ui-section">
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            ข้อมูลบัญชี
          </Typography.Title>
          <EmailForm
            currentEmail={user?.email ?? ''}
            onSubmit={handleEmail}
            onSuccess={() => addToast('success', 'เปลี่ยนอีเมลแล้ว')}
          />
        </div>

        <Card title="เปลี่ยนรหัสผ่าน" variant="borderless">
          <PasswordForm onSubmit={handlePassword} onSuccess={handlePasswordSuccess} />
        </Card>
      </div>
    </PageContainer>
  )
}
