import { Button, Card, Flex, Progress, Space, Tag, Typography } from 'antd'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'

/**
 * Hero mockup — โครงจริงของแอป (แถบบน + การ์ด + progress) ย่อขนาด
 * ทำจาก token/คลาสเดียวกับแอป **ไม่ใช้ asset รูป** (สเปค §6.1, D8)
 * เป็น static ตั้งใจให้เห็นหน้าตาจริงโดยไม่ต้องดึงข้อมูลผู้ใช้
 */
function HeroMockup() {
  return (
    <Card className="landing-mockup" variant="borderless" aria-hidden="true">
      <div className="landing-mockup-bar">
        <span className="landing-mockup-logo">COSPLAN</span>
        <span className="landing-mockup-dot" />
        <span className="landing-mockup-dot" />
        <span className="landing-mockup-dot" />
      </div>
      <div className="landing-mockup-body">
        <div className="landing-mockup-row">
          <div>
            <Typography.Text strong>เรม · Re:Zero</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 'var(--text-sm)' }}>
              อัปเดตล่าสุด 2 ชั่วโมงที่แล้ว
            </Typography.Text>
          </div>
          <Tag color="purple">กำลังทำ</Tag>
        </div>
        <Progress percent={60} showInfo={false} />
        <Flex justify="space-between" style={{ marginTop: 'var(--space-2)' }}>
          <Typography.Text type="secondary" style={{ fontSize: 'var(--text-sm)' }}>
            ความคืบหน้า
          </Typography.Text>
          <Typography.Text style={{ fontSize: 'var(--text-sm)' }}>60%</Typography.Text>
        </Flex>
        <div className="landing-mockup-line" />
        <div className="landing-mockup-line short" />
        <div className="landing-mockup-line shorter" />
      </div>
    </Card>
  )
}

const FEATURES = [
  { title: 'จัดการโปรเจกต์', text: 'เก็บทุกตัวละครไว้ที่เดียว พร้อมงบ สถานะ และบันทึก' },
  { title: 'ติดตามงบ', text: 'เห็นยอดใช้จ่ายจริงเทียบงบที่ตั้งไว้ และฟ้องเมื่อเกิน' },
  { title: 'รายการวัสดุ + ลิงก์ร้าน', text: 'ติ๊กได้ว่าซื้อแล้ว และกดไปร้านได้ในคลิกเดียว' },
  { title: 'ธีมสว่าง/มืด', text: 'ตามที่ถนัด จำค่าที่เลือกไว้ได้' },
]

const STEPS = [
  { title: 'สร้างโปรเจกต์', text: 'ใส่ชื่อตัวละคร ซีรีส์ งบ และรูป' },
  { title: 'เติมรายการวัสดุ', text: 'วิก ชุด รองเท้า พร้อมราคาและลิงก์ร้าน' },
  { title: 'ติดตามความคืบหน้า', text: 'ติ๊กซื้อแล้วทีละชิ้น ความคืบหน้าจะขยับเอง' },
]

const SHOWCASE = [
  { name: 'เรม', series: 'Re:Zero', percent: 60, spent: '฿3,200', budget: '฿5,000' },
  { name: 'ฮัตสึเนะ', series: 'Demon Slayer', percent: 100, spent: '฿4,800', budget: '฿4,800' },
  { name: 'โซดา', series: 'Attack on Titan', percent: 35, spent: '฿1,400', budget: '฿4,000' },
]

/**
 * Landing — หน้าสาธารณะที่ `/` (สเปค §6.1)
 * ผู้ login แล้ว → CTA เป็น "ไปที่ Dashboard" แทนปุ่มล็อกอิน/สมัคร
 */
export default function Landing() {
  const { user } = useAuth()

  return (
    <main className="landing">
      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="public-container landing-hero-grid">
          <div>
            <Typography.Title level={1} className="landing-title">
              Plan your cosplay.
              <br />
              Create your character.
              <br />
              Make it real.
            </Typography.Title>
            <Typography.Paragraph className="landing-subtitle">
              วางแผนคอสเพลย์ตัวโปรดของคุณ — งบ รายการวัสดุ ลิงก์ร้าน และความคืบหน้า
              ทั้งหมดอยู่ในที่เดียว
            </Typography.Paragraph>
            <Space wrap size="middle">
              {user ? (
                <Link to="/dashboard">
                  <Button type="primary" size="large">
                    ไปที่ Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button type="primary" size="large">
                    เริ่มวางแผน
                  </Button>
                </Link>
              )}
              <a href="#showcase">
                <Button size="large">ดูตัวอย่าง</Button>
              </a>
            </Space>
          </div>
          <HeroMockup />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="landing-section">
        <div className="public-container">
          <Typography.Title level={2} className="landing-section-title">
            ทำอะไรได้
          </Typography.Title>
          <div className="landing-grid">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="landing-card" variant="borderless">
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  {feature.title}
                </Typography.Title>
                <Typography.Text type="secondary">{feature.text}</Typography.Text>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="landing-section alt">
        <div className="public-container">
          <Typography.Title level={2} className="landing-section-title">
            ใช้งาน 3 ขั้น
          </Typography.Title>
          <div className="landing-grid">
            {STEPS.map((step, index) => (
              <Card key={step.title} className="landing-card" variant="borderless">
                <Typography.Text className="landing-step-number">{index + 1}</Typography.Text>
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  {step.title}
                </Typography.Title>
                <Typography.Text type="secondary">{step.text}</Typography.Text>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Showcase (static) ── */}
      <section id="showcase" className="landing-section">
        <div className="public-container">
          <Typography.Title level={2} className="landing-section-title">
            ตัวอย่างโปรเจกต์
          </Typography.Title>
          <div className="landing-grid">
            {SHOWCASE.map((item) => (
              <Card key={item.name} className="landing-card" variant="borderless">
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  {item.name}
                </Typography.Title>
                <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                  {item.series}
                </Typography.Text>
                <Progress percent={item.percent} showInfo={false} size="small" />
                <Flex justify="space-between" style={{ marginTop: 'var(--space-2)' }}>
                  <Typography.Text type="secondary" style={{ fontSize: 'var(--text-sm)' }}>
                    {item.spent} / {item.budget}
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 'var(--text-sm)' }}>{item.percent}%</Typography.Text>
                </Flex>
              </Card>
            ))}
          </div>

          <div className="landing-cta">
            <Typography.Title level={3} style={{ marginBottom: 'var(--space-2)' }}>
              ยังไม่มีบัญชี?
            </Typography.Title>
            <Typography.Paragraph type="secondary">
              สร้างบัญชีฟรี เริ่มวางแผนตัวละครของคุณได้เลย
            </Typography.Paragraph>
            {user ? (
              <Link to="/dashboard">
                <Button type="primary" size="large">
                  ไปที่ Dashboard
                </Button>
              </Link>
            ) : (
              <Space wrap size="middle">
                <Link to="/register">
                  <Button type="primary" size="large">
                    สร้างบัญชีฟรี
                  </Button>
                </Link>
                <Link to="/login">มีบัญชีแล้ว — เข้าสู่ระบบ</Link>
              </Space>
            )}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="public-container">
          <Typography.Text type="secondary">COSPLAN — วางแผนคอสเพลย์ให้เป็นเรื่องง่าย</Typography.Text>
        </div>
      </footer>
    </main>
  )
}
