# 03 — หน้า Create Project (`/projects/new`) + ProjectForm

## Composition ปัจจุบัน

`CreateProject.tsx` (69): submitLock + `create()` → `uploadImage()` ต่อเมื่อมีไฟล์ (พลาด → toast ไม่บล็อก) → `navigate(/projects/:id)`
+ `<ProjectForm onSubmit isSubmitting>`

`ProjectForm.tsx` (270): state แยกต่อ field + `validateProject()` รวม → error map → 4 sections (ตัวละคร / รูปภาพ / งบ&สถานะ / รายการสินค้า) + บันทึกย่อ + ปุ่ม submit

**Submit orchestration ของหน้า = byte-identical ห้ามแตะ** — เปลี่ยนแค่ `ProjectForm` internals + ชั้น render error ของหน้า

## `CreateProject.tsx` (page)

| เดิม | antd |
|---|---|
| `<h1>สร้างโปรเจกต์ใหม่</h1>` | `<Typography.Title level={2}>` |
| `{error && <p className="error-message" role="alert">}` | **antd `<Alert type="error" showIcon message={error} role="alert" closable={false} />`** |
| handleSubmit / submitLock / useImageUpload | **ไม่แตะ** |
| container maxWidth 720 | คง (style เดิม + token ใหม่) |

## `ProjectForm.tsx` — หัวใจของหน้าฟอร์ม

### Architecture
- `<form noValidate>` + จัด error manual → **antd `<Form layout="vertical" onFinish={…} noValidate>`**
- **Validation strategy (single source = `validation.ts` เดิม):**
  - `Form.Item name="charName" rules={[…]}` — rules เขียนให้**เรียก validator เดิม**: ใช้ `{ validator: (_, value) => validateProject({ …fields, charName: value }).charName ? reject(msg) : resolve() }` หรือวิธีสะอาดกว่า: **`onFinish` รวม** — รับ values จาก antd แล้วเรียก `validateProject(values)` เหมือนเดิม ถ้ามี error → `form.setFields([{ name: 'charName', errors: [msg] }, …])` → return, ไม่งั้น `onSubmit(payload)` เหมือนเดิม
  - **เลือกแบบหลัง** (onFinish + setFields): ข้อความไทย 100% มาจาก `validation.ts` ที่เดียว, ทดสอบเดิม (`validation.test.ts`) ยังคุ้มครอง logic, antd จัด display error เอง (ใต้ field, aria ครบ)
  - rules เฉพาะ field ที่ antd ทำได้ฟรีและไม่ซ้ำ validator: `required` ก็ใช้ validator รวมนั่นแหละ — **ไม่เขียน rules ซ้ำ** เพื่อกัน message สองมาตรฐาน
- ปุ่ม submit → `<Button type="primary" htmlType="submit" size="large" loading={isSubmitting}>` — label คง: `กำลังบันทึก...` / `สร้างโปรเจกต์` (initialData? = ฟอร์มแก้ไข — ดู 04)

### Section ต่อ section

**1. ตัวละคร** — heading `<Typography.Title level={5}>` คงหัวข้อ, `<Row gutter={16}>`:
| Field | antd | rules/หมายเหตุ |
|---|---|---|
| charName | `<Input id="charName" maxLength={100}>` | ผ่าน `validateProject` (จำเป็น, ≤100) — error จาก setFields |
| seriesName | `<Input id="seriesName">` | ไม่บังคับ (ตาม validation.ts) |

**2. รูปภาพ** — `<ImageUploader imageUrl onChange>` — props/สัญญา **คงเดิม** (internal → antd `Upload.Dragger` — หัวข้อถัดไป)

**3. งบประมาณ & สถานะ** — `<Row gutter={16}>`:
| Field | antd | หมายเหตุ |
|---|---|---|
| budget | `<InputNumber id="budget" min={0} style={{width:'100%'}} addonBefore="฿">` | ค่า string เดิม → เปลี่ยนเป็น number (หรือคง string แล้ว map เหมือนเดิม — เลือก **InputNumber** แล้วใน onFinish: `budget: values.budget ?? 0`) — ≥0 ผ่าน `validateProject` |
| status | `<StatusSelect>` (internal → antd Select) | options จาก `STATUS_LABELS` — **คง component + props** ให้ ProjectForm ไม่ต้องรู้เรื่อง antd Select |

**4. รายการสินค้า** — `<ItemForm onAdd>` + `<ItemList items onRemove>` — **คงสัญญา props**:
- `ItemForm` internal → antd `<Input>` ×3 (name, price → `InputNumber`, shopLink) + `<Select>` (category จาก `CATEGORY_VALUES`) + `<Button type="primary" icon={<PlusOutlined/>}>เพิ่ม</Button>`
  - validation `validateItem` เหมือนเดิม (error map → display ใต้ field ด้วย `<Typography.Text type="danger" role="alert">` หรือ Form.Item ถ้า refactor เป็น antd Form ย่อย — **เลือกคง state model เดิม** แค่เปลี่ยน input → antd, กัน scope บาน)
  - **คง** Enter-guard (`e.preventDefault()` ตอน keydown) — กัน implicit submit
- `ItemList` internal → การ์ด `<Card size="small">` ต่อรายการ หรือ antd `<List>` — คง `isValidUrl` gate + `<a rel="noopener noreferrer">` (**test `shopLinkRender` คุ้มครอง — ห้ามลบ guard**)
  - ปุ่มลบ → `<Button danger size="small">`

**5. บันทึกย่อ** — `<Input.TextArea id="note" rows={3} autoSize={{ minRows: 3, maxRows: 6 }}>`

**6. Actions** — `<Flex justify="flex-end">` + ปุ่ม submit (ด้านบน) — border-top คง via token

### `ImageUploader.tsx` (202 บรรทัด)
| เดิม | antd |
|---|---|
| drop zone div + drag handlers + openFilePicker() manual | **antd `<Upload.Dragger>`** `beforeUpload={() => false}` (ห้าม auto-upload — จัดการเอง) `accept="image/*" maxCount={1} showUploadList={false}` |
| validateImageFile → processImage → preview → `onChange(optimized, objectUrl)` | **คง flow ทั้งหมด** — เรียกจาก `onChange` ของ Dragger (`info.file.originFileObj`) — `src/utils/image.ts` **ไม่แตะ** |
| error `<p className="error-message">` | `<Alert type="error" showIcon message={error} />` |
| ปุ่ม 🔄 เปลี่ยน / 🗑️ ลบ | `<Button>` pair (คง objectUrl revoke logic เดิม — **คง urlRef + revoke ทุกจุด** กัน leak) |
| states empty/selected/error + isDragging/isProcessing | คง state model เดิมทั้งหมด |
| ข้อความ "JPG, PNG, WEBP (สูงสุด 5MB)" | คง (`VALIDATION.MAX_IMAGE_SIZE_MB`) |

**สัญญา `props { imageUrl, onChange(file, previewUrl) }` ห้ามเปลี่ยน** — ProjectForm/EditProject พึ่งพา

## ไม่แตะ
`useProjects.create`, `useImageUpload.uploadImage`, `toUserMessage`, submitLock, navigate, `validateProject`/`validateItem` logic, `image.ts`
