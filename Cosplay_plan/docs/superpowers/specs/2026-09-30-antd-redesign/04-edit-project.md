# 04 — หน้า Edit Project (`/projects/:id/edit`)

> ฟอร์ม = `ProjectForm` ตัวเดียวกับ `03-create-project.md` — **ไฟล์นี้เขียนแค่ delta**

## Composition ปัจจุบัน

`EditProject.tsx` (107): `useProject(id)` → loading / loadError / notFound states → `<ProjectForm initialData={project}>`
handleSubmit: `update()` → `uploadImage()` ต่อถ้ามีไฟล์ใหม่ → navigate · submitLock + error state เหมือน create

## Delta จากหน้า Create

| เรื่อง | รายละเอียด |
|---|---|
| `<h1>` | `แก้ไขโปรเจกต์: {project.charName}` → `<Typography.Title level={2}>` |
| loading state | `กำลังโหลด...` text → `<Center><Spin size="large" tip="กำลังโหลด..." /></Center>` |
| loadError | `<p className="error-message">` + ปุ่มกลับ → **`<ErrorMessage message={loadError} onRetry={…}>` หรือ `<Result status="error">` + `<Button onClick={() => navigate('/')}>กลับหน้าหลัก</Button>`** (คงปุ่มกลับ) |
| notFound | `<h2>ไม่พบโปรเจกต์</h2>` + ปุ่ม → **`<Result status="404" title="ไม่พบโปรเจกต์" extra={<Button>กลับหน้าหลัก</Button>}>`** |
| error ตอน submit | เหมือน create → `<Alert type="error">` |
| form | `initialData={project}` → antd `<Form initialValues={{ … }}>` — คงสัญญา ProjectForm เดิม (initialData prop) |
| ปุ่ม submit label | `บันทึกการแก้ไข` (initialData มี → เหมือนเดิม) |

## กรณี image พิเศษของหน้าแก้ไข (ห้ามพลาด — มี regression มาก่อนแล้ว)

 handleSubmit ปัจจุบัน:
```ts
// ถ้ามีไฟล์ใหม่ → ห้ามเขียน objectUrl (uploadImage จะเขียน URL จริงให้ทีหลัง)
// ถ้าไม่มีไฟล์ใหม่ → ส่ง imageUrl ตรง ๆ ('' = ผู้ใช้กดล้างรูป → เคลียร์ใน Firestore)
...(data.imageFile ? {} : { imageUrl: data.imageUrl })
```
- **สัญญานี้ byte-identical** — ProjectForm ต้องคงการส่ง `imageFile` + `imageUrl` แยกกันเหมือนเดิม
- ImageUploader เลือกรูปใหม่ → `imageFile=File, imageUrl=objectUrl` (preview) → handleSubmit ไม่ส่ง imageUrl → `uploadImage` เขียน URL จริง
- ผู้ใช้กดล้างรูป → `imageFile=null, imageUrl=''` → update เขียน `imageUrl: ''` (ล้างใน Firestore)
- antd Upload (beforeUpload:false) **ห้ามแตะสัญญานี้** — file ต้องเดินทางเป็น `File` เหมือนเดิม

## ไม่แตะ
`useProject` (update/notFound/error), `uploadImage`, submitLock, navigate, error handling ทั้งหมด
