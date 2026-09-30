import { PlusOutlined } from '@ant-design/icons'
import { Button, Checkbox, Input, InputNumber, Select, Typography } from 'antd'
import { useState, type KeyboardEvent } from 'react'
import type { ProjectItem } from '../../services/projectService'
import { CATEGORY_VALUES } from '../../utils/constants'
import { validateItem } from '../../utils/validation'

interface ItemFormProps {
  onAdd: (item: ProjectItem) => void
}

/**
 * ItemForm — เพิ่มรายการสินค้าเข้า ItemList
 * คง state model + validateItem() เดิมทั้งหมด (validation.ts เป็น single source)
 * internal → antd Input/InputNumber/Select/Button
 */
export default function ItemForm({ onAdd }: ItemFormProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [shopLink, setShopLink] = useState('')
  const [category, setCategory] = useState(CATEGORY_VALUES[0])
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAdd = () => {
    const newErrors = validateItem({
      name,
      price: Number(price) || 0,
      shopLink,
    })
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})

    onAdd({
      name: name.trim(),
      price: Number(price) || 0,
      shopLink: shopLink.trim(),
      category,
      done,
    })

    setName('')
    setPrice('')
    setShopLink('')
    setCategory(CATEGORY_VALUES[0])
    setDone(false)
  }

  // ItemForm ซ้อนอยู่ใน <form> ของ ProjectForm — ห้ามให้ Enter ในช่อง item
  // ไป implicit-submit ฟอร์มโปรเจกต์ (สร้างโปรเจกต์ทิ้งตอนกำลังเพิ่มของ)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') e.preventDefault()
  }

  const labelStyle = {
    display: 'block',
    fontSize: 'var(--text-xs)',
    marginBottom: 'var(--space-1)',
    color: 'var(--muted)',
  }

  return (
    /* 6 คอลัมน์บนจอใหญ่ → 2 → 1 คอลัมน์บนมือถือ (media query ใน globals.css กันล้นแนวนอน) */
    <div onKeyDown={handleKeyDown} className="item-form-grid">
      <div>
        <label style={labelStyle}>ชื่อสินค้า *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="เช่น วิก Rem"
          status={errors.name ? 'error' : undefined}
        />
        {errors.name && (
          <Typography.Text
            type="danger"
            role="alert"
            style={{ display: 'block', fontSize: 'var(--text-xs)' }}
          >
            {errors.name}
          </Typography.Text>
        )}
      </div>
      <div>
        <label style={labelStyle}>ราคา</label>
        <InputNumber
          value={price === '' ? null : Number(price)}
          onChange={(v) => setPrice(v === null ? '' : String(v))}
          placeholder="0"
          min={0}
          style={{ width: '100%' }}
          status={errors.price ? 'error' : undefined}
        />
        {errors.price && (
          <Typography.Text
            type="danger"
            role="alert"
            style={{ display: 'block', fontSize: 'var(--text-xs)' }}
          >
            {errors.price}
          </Typography.Text>
        )}
      </div>
      <div>
        <label style={labelStyle}>ลิงก์ร้านค้า</label>
        <Input
          value={shopLink}
          onChange={(e) => setShopLink(e.target.value)}
          placeholder="https://..."
          status={errors.shopLink ? 'error' : undefined}
        />
        {errors.shopLink && (
          <Typography.Text
            type="danger"
            role="alert"
            style={{ display: 'block', fontSize: 'var(--text-xs)' }}
          >
            {errors.shopLink}
          </Typography.Text>
        )}
      </div>
      <div>
        <label style={labelStyle}>หมวดหมู่</label>
        <Select
          value={category}
          onChange={(v) => setCategory(v as typeof category)}
          options={CATEGORY_VALUES.map((cat) => ({ value: cat, label: cat }))}
          style={{ width: '100%' }}
        />
      </div>
      <div>
        <label style={labelStyle}>ซื้อแล้ว</label>
        <Checkbox
          checked={done}
          onChange={(e) => setDone(e.target.checked)}
          style={{ paddingTop: 6 }}
        >
          ซื้อแล้ว
        </Checkbox>
      </div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        disabled={!name.trim()}
      >
        เพิ่ม
      </Button>
    </div>
  )
}
