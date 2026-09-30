# 02 — หน้า Dashboard (`/`)

## Composition ปัจจุบัน

`Dashboard.tsx` (49 บรรทัด): `useProjects` → `calculateStats` + `filterProjects` (useMemo) →
loading=`Loading` / error=`ErrorMessage` / ปกติ = DashboardHeader + StatsCards + SearchBar+StatusFilter + ProjectGrid

**state และ data flow ไม่แตะ** — เปลี่ยนแค่ชั้น render

## การ mapping ทีละ component

### `Dashboard.tsx` (page)
| เดิม | antd |
|---|---|
| `<div style={{ padding: '1.5rem', maxWidth: '1200px' }}>` | `<div className="container">` หรือ style เดิมโดยใช้ token ใหม่ (`--container-max: 1280px`) |
| `<Loading />` / `<ErrorMessage …>` | เหมือนเดิม (internal เปลี่ยนเป็น Spin/Result — ดู `08-shared.md`) |
| แถว SearchBar+StatusFilter `display:flex` | antd `<Flex gap={16} wrap>` |

### `DashboardHeader.tsx`
| เดิม | antd |
|---|---|
| `<h1>Cosplay Planner</h1>` | `<Typography.Title level={1}>` |
| `<Link className="btn btn-primary btn-lg">+ โปรเจกต์ใหม่</Link>` | `<Link to="/projects/new"><Button type="primary" icon={<PlusCircleOutlined />}>โปรเจกต์ใหม่</Button></Link>` |

### `StatsCards.tsx`
| เดิม | antd |
|---|---|
| div.card ×4 + borderLeft สี | `<Row gutter={[16,16]}>` + `<Col xs={12} md={6}>` + `<Card>` หรือ `<Card>` ใน responsive grid |
| label+value manual | **antd `<Statistic label="ทั้งหมด" value={stats.total} />`** |
| borderLeft สี: primary/accent/secondary/purple | `style={{ borderLeft: 4px solid … }}` คงแนวคิด ใช้สี: `colorPrimary` `#ff6b00`, `colorInfo` `#0ea5e9`, `colorSuccess` `#10b981`, `colorWarning` `#f59e0b` (งบรวม) |
| `formatCurrency` local | คง (ใช้ `valueStyle` + string ที่ format แล้ว หรือ `formatter` callback) |

Cards: ทั้งหมด=`colorPrimary` · กำลังทำ=`colorInfo` · เสร็จแล้ว=`colorSuccess` · งบรวม=`colorWarning`

### `SearchBar.tsx`
| เดิม | antd |
|---|---|
| `<input>` + icon 🔍 absolute | **antd `<Input.Search allowClear prefix={<SearchOutlined />} placeholder="ค้นหาชื่อตัวละคร, ซีรีส์, หรือบันทึก..." />`** |
| props `{ value, onChange(string) }` | **คงเดิม** — ห่อ: `onChange={e => onChange(e.target.value)}` |
| `aria-label="ค้นหาโปรเจกต์"` | คง (หรือ `aria-label` บน Input) |

### `StatusFilter.tsx`
| เดิม | antd |
|---|---|
| `<select>` + option "" = ทั้งหมด | **antd `<Select>`** `options = [{value:'', label:'สถานะทั้งหมด'}, …STATUS_VALUES.map(v => ({value:v, label:STATUS_LABELS[v]}))]` |
| props `{ value: string, onChange(string) }` | **คงเดิม** |
| `aria-label="กรองตามสถานะ"` | คง |

หมายเหตุ: `allowClear` ของ Select คืนค่า `undefined` → จับ `onChange(v => onChange(v ?? ''))` กัน state เพี้ยน

### `ProjectGrid.tsx`
| เดิม | antd |
|---|---|
| empty state div + 🎭 | **antd `<Empty image={Empty.PRESET_IMAGE_SIMPLE} description={…}>`** + `<Button type="primary">โปรเจกต์ใหม่</Button>` (เดิมไม่มีปุ่มใน empty — เพิ่มให้ตรง "กด + เพื่อเริ่มสร้าง" ที่เขียนไว้) |
| CSS grid auto-fill 280px | `<Row gutter={[16,16]}>` + `<Col xs={24} sm={12} lg={8}>` (เทียบเท่า 3 คอลัมน์ desktop) |
| props คงเดิม | `{ projects, onDelete }` |

ข้อความ empty: "ยังไม่มีโปรเจกต์" / "กดปุ่มด้านบนเพื่อเริ่มสร้าง" (คงบริบทเดิม)

### `ProjectCard.tsx` (184 บรรทัด — ซับซ้อนที่สุดในหน้านี้)
| เดิม | antd |
|---|---|
| `div.card.card-hover` + `role="button"` + onClick/keydown navigate | **antd `<Card hoverable>`** + onClick เดิม, **คง** `role="button" tabIndex aria-label` (antd Card ไม่ให้ keyboard activation → คง handler เดิม) |
| รูป 140px / 🎭 | `<Card cover={<Image … />}>` — ใช้ antd `<Image>` (มี preview คลิกดูใหญ่ได้ฟรี) fallback = div 🎭 เดิม |
| h3 + p truncate | `<Typography.Title level={5} ellipsis>` + `<Typography.Text type="secondary" ellipsis>` |
| `.badge` (STATUS_LABELS) | **antd `<Tag color={STATUS_TAG_COLOR[status]}>`** — map: planning=`blue`, active=`processing`, waiting=`gold`, completed=`success`, cancelled=`error` (ใส่ map ใน `00-overview`/`constants` — ตัว map นี้ใช้ซ้ำที่หน้า detail ด้วย) |
| แถว 📦 N รายการ / งบ | `<Flex justify="space-between">` + `<Typography.Text>` คง `formatCurrency`/`formatRelativeTime` |
| ปุ่ม ✏️ แก้ไข / 🗑️ ลบ (`btn …sm` + `stopPropagation`) | `<Button size="small" icon={<EditOutlined/>} onClick={stopPropagation เดิม}>` + `<Button size="small" danger icon={<DeleteOutlined/>}>` |
| ConfirmDialog (sibling นอก role=button) | **คงโครง sibling เดิม** (internal = antd Modal — `08-shared.md`) |
| confirmDelete / addToast | ไม่แตะ |

### states ของหน้า
- loading → `<Loading>` (internal = `<Spin size="large" tip="กำลังโหลด...">`)
- error → `<ErrorMessage message onRetry={refresh}>` (internal = `<Result status="error">` + ปุ่มลองใหม่)

## ไม่แตะ
`useProjects`, `calculateStats`, `filterProjects`, `remove` (optimistic), `addToast` API, navigate flow ทั้งหมด
