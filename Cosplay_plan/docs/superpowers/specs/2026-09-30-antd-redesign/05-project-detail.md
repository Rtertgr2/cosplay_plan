# 05 — หน้า Project Detail (`/projects/:id`)

## Composition ปัจจุบัน

`ProjectDetail.tsx` (144): `useProject` → actions row (กลับ/แก้ไข/ลบ) + ConfirmDialog →
ProjectHero → ชื่อ/ซีรีส์/ProjectStatus → งบ+จำนวน → ProjectNote → ProjectItems

**state + handleDelete (remove → navigate / catch → toast) ไม่แตะ**

## Delta ทีละ component

### Page actions row
| เดิม | antd |
|---|---|
| 3 ปุ่ม `btn …` (← กลับ / ✏️ แก้ไข / 🗑️ ลบ) | **`<Space wrap>`**: `<Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>กลับ</Button>` · `<Button type="primary" icon={<EditOutlined />}>แก้ไข</Button>` · `<Button danger icon={<DeleteOutlined />}>ลบ</Button>` |

### states
| state | antd |
|---|---|
| loading | `<Center><Spin size="large" tip="กำลังโหลด..." /></Center>` |
| error | `<Result status="error" title={error} extra={<Button type="primary">กลับหน้าหลัก</Button>}>` (หรือ `<ErrorMessage>` เหมือนหน้าอื่น — เลือก **ErrorMessage ให้ทุกหน้า uniform**) |
| notFound | `<Result status="404" title="ไม่พบโปรเจกต์" extra={Button กลับหน้าหลัก}>` |

### ConfirmDialog (ลบ)
คงสัญญา props เดิม — internal = antd Modal (`08-shared.md`) · `handleDelete` ไม่แตะ

### `ProjectHero.tsx`
| เดิม | antd |
|---|---|
| div gradient + img หรือ 🎭 | **คงโครง hero** (gradient `colorPrimary → purple` ผ่าน token ใหม่) + `<Image>` antd ถ้ามีรูป (ได้ preview ซูมฟรี) / 🎭 fallback เดิม |
| props `{ imageUrl, charName }` | คงเดิม |

### Header block (ชื่อ/ซีรีส์/สถานะ/งบ)
| เดิม | antd |
|---|---|
| `<h1>` charName | `<Typography.Title level={2}>` |
| `<p>` seriesName | `<Typography.Text type="secondary">` |
| `<ProjectStatus status>` | **คง component** — internal → `<Tag color={STATUS_TAG_COLOR[status]}>{STATUS_LABELS[status]}</Tag>` (map เดียวกับ ProjectCard — เก็บ map ไว้ที่เดียวใน `utils/constants.ts` หรือ `theme/`) |
| แถว 💰 งบ / 📦 N รายการ | `<Flex gap="large">` + `<Typography.Text>` + ไอคอน antd (`WalletOutlined`, `ShoppingOutlined`) หรือคง emoji — **เลือกไอคอน antd ให้เป็นระบบเดียว** |

### `ProjectNote.tsx`
| เดิม | antd |
|---|---|
| h3 + div pre-wrap | `<Card size="small" title="บันทึกย่อ">` + `<Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>` (คง `wordBreak`) |
| `if (!note) return null` | คง |

### `ProjectItems.tsx` (read-only list หน้า detail)
| เดิม | antd |
|---|---|
| h3 "รายการสินค้า" + div rows | `<Typography.Title level={5}>` + **antd `<List>`** (`dataSource=items`, `renderItem`) |
| ชื่อ + หมวด/ราคา | `<List.Item.Meta title={name} description={<>{category} · ฿{price}</>}>` |
| ลิงก์ร้านค้า `<a style=…>` | **คง `<a href target="_blank" rel="noopener noreferrer">`** หรือ `<Button type="link" href …>` — **ข้อบังคับจาก test `shopLinkRender`: `<a` ต้องไม่ถูกสร้างจาก `javascript:` link (guard `isValidUrl` ห้ามลบ) และ link ที่ดีต้องมี `rel="noopener noreferrer"`** |
| empty | `<Empty description="ยังไม่มีรายการสินค้า" />` หรือคง `<p>` — เลือก `<Empty>` คงข้อความ |
| ปุ่ม "ไปที่ร้านค้า" (ปุ่ม primary-bg style) | `<Button type="primary" ghost size="small" href={item.shopLink} target="_blank">` — ต้อง verify ว่า antd สร้าง `rel` ตาม (ถ้าไม่ → คง `<a>` manual + styled) |

**หมายเหตุ a11y**: `<a>` ทั้งหมดห้ามมาจาก URL อันตราย — `isValidUrl` (http/https เท่านั้น) คงอยู่ใน `validation.ts` ห้ามแตะ

## ไม่แตะ
`useProject` (remove/notFound/error), `toUserMessage`, `formatCurrency`, navigate flow
