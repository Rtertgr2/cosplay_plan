import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProjectItems from './ProjectItems'
import ItemList from './ItemList'
import type { ProjectItem } from '../../services/projectService'

const evil: ProjectItem[] = [
  { name: 'วิก Rem', price: 0, shopLink: 'javascript:alert(1)', category: 'วิก' },
]
const good: ProjectItem[] = [
  { name: 'วิก Rem', price: 500, shopLink: 'https://shopee.co.th/item/1', category: 'วิก' },
]

/**
 * Defensive render — ข้อมูลเก่าใน Firestore อาจมี shopLink อันตรายอยู่
 * ต้องไม่ถูก render เป็น <a> ให้คลิก (Review Focus #1)
 */
describe('defensive shopLink render', () => {
  it('ProjectItems ไม่สร้าง <a> จาก javascript: link', () => {
    const html = renderToStaticMarkup(<ProjectItems items={evil} />)
    expect(html).not.toContain('<a')
    expect(html).not.toContain('javascript:')
  })

  it('ProjectItems สร้าง <a> จาก https link', () => {
    const html = renderToStaticMarkup(<ProjectItems items={good} />)
    expect(html).toContain('href="https://shopee.co.th/item/1"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('ItemList ไม่สร้าง <a> จาก javascript: link', () => {
    const html = renderToStaticMarkup(<ItemList items={evil} onRemove={() => {}} />)
    expect(html).not.toContain('<a')
    expect(html).not.toContain('javascript:')
  })

  it('ItemList สร้าง <a> จาก https link', () => {
    const html = renderToStaticMarkup(<ItemList items={good} onRemove={() => {}} />)
    expect(html).toContain('href="https://shopee.co.th/item/1"')
  })
})
