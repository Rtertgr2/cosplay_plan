# Cosplan UI Redesign Plan

> เป้าหมาย: ปรับ UI ของ Cosplan จากหน้าตาแบบ Admin/Dashboard Prototype ให้กลายเป็น Product Web App ที่สามารถนำไป Demo, Presentation และใส่ Portfolio ได้

---

## 1. เป้าหมายของการ Redesign

ปัจจุบันระบบมีฟังก์ชันหลักสำหรับจัดการ Cosplay Project อยู่แล้ว แต่ UI ควรเปลี่ยนจากแนว **CRUD/Admin Dashboard** ไปเป็น **Product Web App** ที่มี Brand Identity และ User Experience ที่ชัดเจน

### เป้าหมายหลัก

- เว็บดูเป็น Product จริง ไม่ใช่ระบบหลังบ้าน
- มี Landing Page สำหรับนำเสนอโปรเจกต์
- UI ทุกหน้ามี Design System เดียวกัน
- Project Card ดูน่าสนใจและอ่านง่าย
- Project Detail สามารถใช้เป็นหน้า Showcase ได้
- Create/Edit Project ใช้งานง่ายขึ้น
- Responsive ทั้ง Desktop และ Mobile
- มี Loading / Empty / Error State
- มี Micro-interaction ที่เหมาะสม
- ไม่ทำ UI ให้ซับซ้อนหรือรกโดยไม่จำเป็น

---

# 2. UI Architecture

โครงสร้างหน้าเว็บที่ต้องการ:

```text
COSPLAN
│
├── Public / Marketing
│   ├── Landing Page
│   ├── Features
│   ├── How It Works
│   ├── Showcase
│   └── Login / Register
│
├── Authentication
│   ├── Login
│   └── Register
│
└── Application
    ├── Dashboard
    ├── Projects
    ├── Create Project
    ├── Edit Project
    ├── Project Detail
    └── Settings / Profile
```

---

# 3. Task Overview

| Task | Priority | Status |
|---|---|---|
| UI Design System | P0 | TODO |
| Landing Page | P0 | TODO |
| Navigation | P0 | TODO |
| Dashboard Redesign | P0 | TODO |
| Project Card | P0 | TODO |
| Project Detail | P0 | TODO |
| Create Project UX | P0 | TODO |
| Edit Project UX | P1 | TODO |
| Login / Register | P1 | TODO |
| Responsive Mobile | P0 | TODO |
| Loading State | P1 | TODO |
| Empty State | P1 | TODO |
| Error State | P1 | TODO |
| Micro-interaction | P2 | TODO |
| Accessibility | P1 | TODO |
| Final UI QA | P0 | TODO |

---

# 4. Task 01 — Design System

## เป้าหมาย

สร้าง Visual Language เดียวสำหรับทั้งเว็บไซต์

## 4.1 Typography

กำหนด Typography Scale:

```text
Display
48–56px / 700

H1
40–48px / 700

H2
32px / 700

H3
24px / 600

H4
20px / 600

Body
16px / 400

Small
14px / 400

Caption
12–13px / 400
```

## 4.2 Spacing

ใช้ spacing scale เดียว:

```text
4
8
12
16
24
32
48
64
96
```

ห้ามกำหนด spacing แบบสุ่มในแต่ละหน้า

## 4.3 Color Tokens

ตัวอย่าง Brand Theme:

```text
Primary      #7C3AED
Primary Dark #6D28D9

Background   #FAFAFC
Surface      #FFFFFF

Text         #18181B
Muted        #71717A
Border       #E4E4E7

Success      #16A34A
Warning      #D97706
Danger       #DC2626
```

> สามารถเปลี่ยนสี Brand ได้ภายหลัง แต่ต้องใช้ผ่าน Design Token เท่านั้น

## 4.4 Border Radius

```text
Small  8px
Medium 12px
Large  16px
XL     24px
```

## 4.5 Shadow

ใช้ Shadow เท่าที่จำเป็น:

```text
Card:
0 2px 8px rgba(...)

Elevated:
0 8px 24px rgba(...)
```

ไม่ควรใส่ Shadow ให้ทุก element

---

# 5. Task 02 — Landing Page

## เป้าหมาย

ทำให้คนที่เปิดเว็บไซต์ครั้งแรกเข้าใจทันทีว่า Cosplan คืออะไร

## Structure

```text
Navbar
↓
Hero
↓
Features
↓
How It Works
↓
Project Showcase
↓
CTA
↓
Footer
```

## Hero

ตัวอย่าง:

```text
Plan your cosplay.
Create your character.
Make it real.

จัดการ Cosplay Project ของคุณ
ตั้งแต่วางแผนจนถึงวันขึ้นเวที

[ Start Planning ]
[ Explore Projects ]

              Hero Image
```

### Requirements

- มี Headline ที่ชัด
- มีคำอธิบายสั้น
- มี CTA
- มีภาพ Cosplay / Project
- Responsive
- ไม่ใส่ข้อความยาวเกินไป

---

# 6. Task 03 — Navigation

## Public Navigation

```text
COSPLAN

Features
How it works
Showcase

Login
[ Get Started ]
```

## App Navigation

```text
COSPLAN

Home
My Projects
Create Project

────────────

Settings
Profile
```

## Mobile

ใช้ Header:

```text
COSPLAN                         ☰
```

หรือ Bottom Navigation:

```text
Home | Projects | Create | Profile
```

### Requirements

- Active state ชัดเจน
- Hover state
- Keyboard focus
- Mobile-friendly
- ไม่ให้ Navigation มีเมนูเยอะเกินจำเป็น

---

# 7. Task 04 — Dashboard Redesign

## เป้าหมาย

เปลี่ยน Dashboard จาก Admin UI เป็น Personal Workspace

## Layout

```text
Good afternoon 👋

Plan your next cosplay

[ + Create New Project ]

────────────────────────────

Your Projects                         View all →

[ Project Card ]
[ Project Card ]
[ Project Card ]

────────────────────────────

Recent Activity
```

## Requirements

- Greeting
- Quick Action
- Project Overview
- Recent Projects
- Empty State
- Responsive Grid

---

# 8. Task 05 — Project Card

## เป้าหมาย

ทำให้แต่ละ Cosplay Project ดูเหมือน Product/Portfolio Item

## Structure

```text
┌─────────────────────────────┐
│                             │
│        PROJECT IMAGE        │
│                             │
│                         ⋮   │
├─────────────────────────────┤
│ Hatsune Miku                │
│ Vocaloid                    │
│                             │
│ Progress                    │
│ ███████████░░░ 72%          │
│                             │
│ ฿3,250 / ฿5,000              │
│                             │
│ Updated 2 days ago          │
└─────────────────────────────┘
```

## Requirements

- Image ratio เดียวกัน
- Project Name
- Character / Category
- Progress
- Budget Summary
- Last Updated
- More Action
- Hover Effect
- Clickable Card
- Responsive

### ห้าม

ไม่ควรใส่ข้อมูลทุกอย่างลง Card

ข้อมูลรายละเอียดควรอยู่ใน Project Detail

---

# 9. Task 06 — Project Detail

## เป้าหมาย

ทำให้หน้า Project Detail สามารถใช้เป็นหน้า Showcase ได้

## Structure

```text
← Back to Projects

┌─────────────────────────────────────┐
│                                     │
│             HERO IMAGE              │
│                                     │
└─────────────────────────────────────┘

Hatsune Miku
Vocaloid • Project #001

[ Edit Project ] [ Share ]

─────────────────────────────────────

Progress

72%

██████████████████░░░░

─────────────────────────────────────

Budget

฿3,250 spent
฿5,000 budget

─────────────────────────────────────

Materials

✓ Wig
✓ Costume
○ Shoes
○ Accessories

─────────────────────────────────────

Notes

Project notes...
```

## Requirements

- Hero Image
- Project Information
- Progress
- Budget
- Materials
- Notes
- Edit
- Share
- Back Navigation
- Mobile Layout

---

# 10. Task 07 — Create Project

## เป้าหมาย

เปลี่ยน Form ขนาดใหญ่ให้เป็น Guided Form

## Step Flow

```text
① Basic Info
      ↓
② Character
      ↓
③ Budget
      ↓
④ Materials
      ↓
⑤ Review
```

## Step 1 — Basic Info

```text
Create your cosplay

Tell us about your project

Project Name
[________________]

Character
[________________]

Description
[________________]


[ Continue → ]
```

## Step 2 — Character

```text
Character Image

┌────────────────────┐
│                    │
│    Upload Image    │
│                    │
└────────────────────┘

Character Name
[________________]

[ ← Back ] [ Continue → ]
```

## Step 3 — Budget

```text
Budget
[ ฿ __________ ]

Estimated Cost
[ ฿ __________ ]
```

## Step 4 — Materials

```text
Materials

[ Add Material ]

✓ Wig
✓ Costume
○ Shoes
○ Accessories
```

## Step 5 — Review

แสดงข้อมูลทั้งหมดก่อน Create

```text
Project Summary

Name
Character
Budget
Materials
Notes

[ ← Back ]

[ Create Project ]
```

---

# 11. Task 08 — Edit Project

ใช้ Layout เดียวกับ Create Project

แต่ต้อง:

- Pre-fill ข้อมูลเดิม
- แสดง Current Image
- สามารถเปลี่ยน Image
- Save Changes
- Cancel
- Confirm ก่อน Delete

---

# 12. Task 09 — Login / Register

## เป้าหมาย

ทำ Authentication ให้มี Brand Identity

## Login

```text
COSPLAN

Plan your cosplay.
Bring your character to life.

Email
[________________]

Password
[________________]

[ Login ]

Don't have an account?
Create one
```

## Register

```text
Create your Cosplan account

Name
[________________]

Email
[________________]

Password
[________________]

Confirm Password
[________________]

[ Create Account ]
```

## Requirements

- Consistent branding
- Validation
- Loading State
- Error State
- Password visibility toggle
- Mobile responsive

---

# 13. Task 10 — Empty State

ทุกหน้าที่สามารถไม่มีข้อมูล ต้องมี Empty State

## Projects

```text
                ✨

       No cosplay plans yet

   Start planning your first
   cosplay project.

       [ + Create Project ]
```

## Search

```text
             🔍

      No projects found

Try changing your search
or filters.
```

---

# 14. Task 11 — Loading State

ใช้ Skeleton แทนข้อความ Loading ธรรมดา

## Project Card Skeleton

```text
┌────────────────────┐
│ ░░░░░░░░░░░░░░░░   │
│ ░░░░░░░░░░░░░░░░   │
├────────────────────┤
│ ░░░░░░░░           │
│ ░░░░░░             │
│ ░░░░░░░░░░░░       │
└────────────────────┘
```

### Requirements

- Dashboard Skeleton
- Project Card Skeleton
- Detail Skeleton
- Button Loading
- Form Submit Loading

---

# 15. Task 12 — Error State

## Standard Error

```text
Something went wrong

We couldn't load your projects.
Please try again.

[ Try Again ]
```

## Requirements

- Human-readable message
- Retry Button
- ไม่แสดง Firebase Error ตรง ๆ ให้ User
- Console ต้องยังมี Error สำหรับ Developer

---

# 16. Task 13 — Micro-interaction

เพิ่ม Animation แบบ subtle

## Card

```text
Hover
↓
translateY(-2px)
↓
Shadow เพิ่มเล็กน้อย
```

## Button

```text
Hover
↓
Color transition
```

## Image

```text
Hover
↓
Scale 1.02
```

## Progress

Progress bar สามารถ animate ตอนโหลด

### ห้าม

- Animation ทุก element
- Bounce เยอะเกินไป
- Transition ช้า
- Page transition ที่รบกวนการใช้งาน

---

# 17. Task 14 — Responsive Design

## Desktop

```text
1200px+
```

ใช้:

```text
Sidebar
Multi-column Grid
Large Hero
```

## Tablet

```text
768px – 1199px
```

ลด:

- Grid columns
- Padding
- Typography

## Mobile

```text
< 768px
```

ต้อง:

- ไม่มี Horizontal Scroll
- Button กดง่าย
- Card 1 column
- Form 1 column
- Navigation แบบ Mobile
- Hero ลดขนาด
- Modal ใช้พื้นที่เหมาะสม
- Table เปลี่ยนเป็น Card/List หากจำเป็น

---

# 18. Task 15 — Accessibility

ตรวจ:

- Color Contrast
- Keyboard Navigation
- Focus State
- Button มี Accessible Label
- Image มี alt
- Form มี Label
- Error Message เชื่อมกับ Input
- Interactive element กดด้วย Keyboard ได้

---

# 19. Task 16 — Component Architecture

ควรแยก Component ที่ใช้ซ้ำ

ตัวอย่าง:

```text
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout
│   │   ├── PublicLayout
│   │   ├── Navbar
│   │   ├── Sidebar
│   │   └── MobileNav
│   │
│   ├── project/
│   │   ├── ProjectCard
│   │   ├── ProjectGrid
│   │   ├── ProjectHero
│   │   ├── ProjectProgress
│   │   ├── BudgetSummary
│   │   └── MaterialList
│   │
│   ├── form/
│   │   ├── ProjectForm
│   │   ├── ImageUpload
│   │   └── FormStep
│   │
│   └── common/
│       ├── EmptyState
│       ├── ErrorState
│       ├── LoadingState
│       └── PageHeader
│
├── pages/
│   ├── Landing
│   ├── Login
│   ├── Register
│   ├── Dashboard
│   ├── Projects
│   ├── CreateProject
│   ├── EditProject
│   └── ProjectDetail
│
└── styles/
    ├── tokens.css
    ├── globals.css
    └── layout.css
```

---

# 20. Task 17 — UI Rules

## ใช้

- White Space
- Consistent spacing
- Clear hierarchy
- Large readable headings
- Consistent cards
- Consistent buttons
- Clear CTA
- Responsive layout

## หลีกเลี่ยง

- Gradient ทุกที่
- Glassmorphism ทุก Card
- Shadow หนัก
- สีเยอะ
- Icon เยอะ
- Border ทุก element
- Dashboard ที่มีข้อมูลเกินจำเป็น
- Modal ซ้อนกัน
- Sidebar ที่มีเมนูมากเกินไป

---

# 21. Task 18 — Demo / Portfolio Optimization

หน้าเหล่านี้ต้องถูกเตรียมสำหรับการนำเสนอ:

### Landing

คนดูต้องเข้าใจ Product ภายใน 5–10 วินาที

### Dashboard

ต้องเห็น Project และความคืบหน้าได้ทันที

### Project Detail

ต้องเป็นหน้าที่ดูดีที่สุด เพราะใช้ Showcase

### Create Project

ต้องแสดง UX ที่ออกแบบมาอย่างตั้งใจ

### Responsive

ต้องสามารถเปิด Demo บนมือถือได้

---

# 22. Recommended Development Order

ไม่ควรทำทุกอย่างพร้อมกัน

## Phase 1 — Foundation

```text
[ ] Design Tokens
[ ] Typography
[ ] Color
[ ] Spacing
[ ] Button
[ ] Card
[ ] Input
[ ] Layout
```

## Phase 2 — Core UI

```text
[ ] Navigation
[ ] Dashboard
[ ] Project Card
[ ] Project Grid
[ ] Project Detail
```

## Phase 3 — Public Website

```text
[ ] Landing Page
[ ] Hero
[ ] Features
[ ] How It Works
[ ] Showcase
[ ] CTA
[ ] Footer
```

## Phase 4 — Forms

```text
[ ] Create Project
[ ] Edit Project
[ ] Step Form
[ ] Validation
[ ] Review
```

## Phase 5 — UX States

```text
[ ] Loading
[ ] Empty
[ ] Error
[ ] Success
```

## Phase 6 — Responsive

```text
[ ] Desktop
[ ] Tablet
[ ] Mobile
[ ] Mobile Navigation
```

## Phase 7 — Polish

```text
[ ] Animation
[ ] Hover
[ ] Focus
[ ] Accessibility
[ ] Final QA
```

---

# 23. Final Acceptance Checklist

ก่อนถือว่า UI Redesign เสร็จ ต้องผ่านทั้งหมด:

## Visual

- [ ] ทุกหน้าใช้ Color Token เดียวกัน
- [ ] Typography เป็นระบบเดียวกัน
- [ ] Spacing เป็นระบบเดียวกัน
- [ ] Card Style เหมือนกัน
- [ ] Button Style เหมือนกัน
- [ ] Border Radius เหมือนกัน

## UX

- [ ] User เข้าใจ Landing Page ทันที
- [ ] Create Project ทำได้โดยไม่สับสน
- [ ] Project Detail อ่านง่าย
- [ ] Error เข้าใจง่าย
- [ ] Empty State มี CTA
- [ ] Loading ไม่ทำให้ UI กระโดด

## Responsive

- [ ] Desktop
- [ ] Tablet
- [ ] Mobile
- [ ] ไม่มี Horizontal Scroll
- [ ] Button กดง่าย
- [ ] Form ใช้งานบนมือถือได้

## Technical

- [ ] ไม่แก้ Business Logic โดยไม่จำเป็น
- [ ] Firebase ยังทำงานเหมือนเดิม
- [ ] Routing ทำงาน
- [ ] Authentication ทำงาน
- [ ] CRUD Project ทำงาน
- [ ] Image Upload ทำงาน
- [ ] ไม่มี Console Error

## Presentation

- [ ] Landing Page ดูเป็น Product จริง
- [ ] Dashboard ดูสะอาด
- [ ] Project Detail ใช้ Showcase ได้
- [ ] Create Project ดูเป็น UX จริง
- [ ] Mobile UI พร้อม Demo
- [ ] มี Brand Identity

---

# 24. Definition of Done

UI Redesign ถือว่าเสร็จเมื่อ:

```text
Landing
    ↓
Login
    ↓
Dashboard
    ↓
Projects
    ↓
Project Detail
    ↓
Create Project
    ↓
Edit Project
```

ทุกหน้ามี Visual Language เดียวกัน

และสามารถเปิดเว็บเพื่อ Demo ได้โดยไม่รู้สึกว่าเป็นเพียง Admin CRUD Interface

เป้าหมายสุดท้าย:

> **Cosplan should feel like a real product, not just a working project.**
