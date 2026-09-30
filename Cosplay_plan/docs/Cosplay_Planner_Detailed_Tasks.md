# Cosplay Planner — Detailed Task Breakdown

> เอกสารนี้เป็น execution plan สำหรับ migrate โปรเจกต์ Cosplay Planner จาก
> **Vanilla HTML/JS + Google Apps Script + Google Sheets**
> ไปเป็น
> **React + Vite + Firebase (Firestore + Storage + Authentication + Hosting)**

---

# 0. Project Goal

## Current

```text
Browser
  ↓
HTML
  ↓
Vanilla JS
  ↓
Google Apps Script
  ↓
Google Sheets

Image
  ↓
Base64
  ↓
Google Sheets
```

## Target

```text
Browser
  ↓
React + Vite
  ↓
Firebase SDK
  ├── Firestore      → Project data
  ├── Storage        → Images
  └── Auth           → Users
        ↓
Firebase Hosting
```

## Important Migration Principles

1. อย่ารื้อระบบเดิมทั้งหมดในครั้งเดียว
2. สร้าง React/Firebase layer ขนานกับของเดิมก่อน
3. ย้าย data layer ก่อน UI redesign
4. UI component ห้ามผูกกับ Firestore โดยตรง
5. Image ห้ามเก็บเป็น Base64 ใน database ใหม่
6. Authentication และ Security Rules ต้องออกแบบพร้อม data model
7. ลบ legacy code หลังระบบใหม่ผ่าน acceptance test เท่านั้น
8. ทุก Task ต้องมี acceptance criteria และสามารถตรวจสอบแยกได้

---

# 1. Existing Codebase Inventory

ZIP ปัจจุบันมี:

```text
cosplay_plan-main/
├── .gitignore
├── index.html
├── gas/
│   └── Code.gs
└── src/
    ├── js/
    │   ├── api.js
    │   ├── app.js
    │   ├── image.js
    │   ├── state.js
    │   └── ui.js
    └── style.css
```

## Current Responsibilities

| Current file | Current role | New target |
|---|---|---|
| `index.html` | Page shell + all UI markup | `index.html` + React |
| `src/js/app.js` | App lifecycle, dashboard, project form/detail logic, events | `pages/` + `hooks/` |
| `src/js/api.js` | GAS HTTP API | `services/projectService.js` |
| `src/js/state.js` | localStorage + temporary state | `hooks/` + React state |
| `src/js/ui.js` | DOM rendering, views, toast, theme | React components |
| `src/js/image.js` | client image processing + Base64 | `utils/image.js` + `storageService.js` |
| `src/style.css` | current styling | `styles/` + component styles |
| `gas/Code.gs` | CRUD + search + Google Sheets | Firestore service + rules |

## Existing Data Fields

จาก codebase เดิมพบ field หลัก:

```text
id
charName
seriesName
budget
status
note
items[]
base64Image
createdAt
updatedAt
```

และ item มี:

```text
name
price
shopLink
category
```

---

# 2. Status Definition

ใช้สถานะนี้เป็น task state:

```text
[ ] TODO
[~] IN PROGRESS
[x] DONE
[!] BLOCKED
[-] DEFERRED
```

## Definition of Done ของทุก Task

Task จะถือว่า DONE เมื่อ:

- implementation เสร็จ
- code ไม่มี TODO ที่เป็น blocking
- acceptance criteria ผ่าน
- ไม่มี regression ใน feature ที่เกี่ยวข้อง
- ถ้ามี config/rules/schema มี documentation
- Git commit พร้อมข้อความที่อธิบายงาน

---

# PHASE 1 — BASELINE / FOUNDATION

---

# TASK T01 — Freeze Existing Behavior

### Goal

เก็บ behavior ของเว็บเดิมไว้เป็น baseline ก่อนเริ่ม migrate

### Depends On

ไม่มี

### Source Files

```text
index.html
src/js/app.js
src/js/api.js
src/js/state.js
src/js/ui.js
src/js/image.js
gas/Code.gs
```

### Scope

ตรวจสอบ feature ที่มีอยู่:

```text
Dashboard
 ├── project list
 ├── search
 ├── status filter
 ├── statistics
 ├── create
 ├── edit
 └── delete

Project Detail
 ├── project information
 ├── image
 ├── items
 └── shop links

Project Form
 ├── character
 ├── series
 ├── budget
 ├── status
 ├── note
 ├── image
 └── items

Theme
 └── light/dark mode
```

### Steps

1. เปิดเว็บเวอร์ชันเดิม
2. ทดลอง create project
3. ทดลอง edit
4. ทดลอง delete
5. ทดลอง search
6. ทดลอง status filter
7. ทดลอง upload image
8. ทดลองเปิด detail
9. ทดลอง theme toggle
10. จดพฤติกรรมที่ต้อง preserve

### Deliverables

```text
docs/
└── legacy-behavior.md
```

### Acceptance Criteria

- [ ] feature list ครบ
- [ ] known limitations ของระบบเก่าถูกบันทึก
- [ ] data fields ถูกบันทึก
- [ ] ไม่มีการแก้ behavior เดิมโดยไม่จำเป็น

### Suggested Commit

```text
docs: document legacy behavior before migration
```

---

# TASK T02 — Create Migration Branch / Backup

### Goal

สร้างจุด rollback

### Steps

```bash
git status
git checkout -b migration/react-firebase
git tag legacy-before-react-migration
```

### Deliverables

Git branch:

```text
migration/react-firebase
```

### Acceptance Criteria

- [ ] branch แยกแล้ว
- [ ] working tree ไม่มี accidental changes
- [ ] legacy commit/tag ถูกเก็บ

### Suggested Commit

```text
chore: prepare migration branch
```

---

# TASK T03 — Define Target Folder Structure

### Goal

กำหนด architecture ก่อนเขียน component

### Target

```text
src/
├── components/
│   ├── common/
│   ├── layout/
│   ├── dashboard/
│   └── project/
│
├── pages/
├── services/
├── hooks/
├── context/
├── utils/
└── styles/
```

### Files to Create

```text
src/
├── components/
├── pages/
├── services/
├── hooks/
├── context/
├── utils/
└── styles/
```

### Acceptance Criteria

- [ ] folder architecture approved
- [ ] component ไม่ใส่ service logic
- [ ] service ไม่ใส่ DOM code
- [ ] page เป็น orchestration layer
- [ ] shared component อยู่ใน `components/common`

### Suggested Commit

```text
chore: establish react project structure
```

---

# TASK T04 — Convert Project to Vite + React

### Goal

เปลี่ยน entry point จาก Vanilla JS เป็น React

### Install

```bash
npm install
npm install react react-dom react-router-dom
npm install -D vite @vitejs/plugin-react
```

### Files

```text
index.html
src/main.jsx
src/App.jsx
vite.config.js
package.json
```

### `src/main.jsx`

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### `src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Dashboard</div>} />
        <Route path="/projects/new" element={<div>Create Project</div>} />
        <Route path="/projects/:id" element={<div>Project Detail</div>} />
        <Route path="/projects/:id/edit" element={<div>Edit Project</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Acceptance Criteria

- [ ] `npm run dev` เปิดได้
- [ ] React render ได้
- [ ] route ทำงาน
- [ ] ไม่มี dependency จาก `window.App`
- [ ] ไม่มี dependency จาก `window.UI`

### Suggested Commit

```text
feat: bootstrap react vite application
```

---

# TASK T05 — Configure Environment Strategy

### Goal

แยก config ออกจาก source code

### Files

```text
.env
.env.example
.gitignore
```

### `.env.example`

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### `.gitignore`

ต้องมี:

```text
.env
.env.local
.env.*.local
```

### Acceptance Criteria

- [ ] ไม่มี secret/config hard-code
- [ ] `.env` ไม่เข้า Git
- [ ] clone project ใหม่แล้วรู้ว่าต้องตั้งค่าอะไรจาก `.env.example`

### Suggested Commit

```text
chore: add environment configuration strategy
```

---

# PHASE 2 — FIREBASE FOUNDATION

---

# TASK T06 — Create Firebase Project

### Goal

เตรียม cloud project

### Enable

```text
Firestore Database
Storage
Authentication
Hosting
```

### Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init
```

### Initialize

เลือก:

```text
Firestore
Storage
Hosting
```

### Acceptance Criteria

- [ ] Firebase project สร้างแล้ว
- [ ] local CLI login ได้
- [ ] project alias/config ถูกต้อง
- [ ] `firebase.json` ถูกสร้าง

---

# TASK T07 — Firebase SDK Initialization

### Goal

สร้าง Firebase singleton

### File

```text
src/services/firebase.js
```

### Code

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
```

### Acceptance Criteria

- [ ] app initialize ได้
- [ ] Firestore instance ใช้งานได้
- [ ] Storage instance ใช้งานได้
- [ ] Auth instance ใช้งานได้

### Suggested Commit

```text
feat: initialize firebase services
```

---

# TASK T08 — Define Firestore Schema

### Goal

ออกแบบ database ให้แทน Google Sheets

### Current Google Sheets columns

```text
ProjectID
Character
Series
Budget
Status
Note
Items_JSON
Base64_Image
CreatedAt
UpdatedAt
```

### New Firestore

```text
projects/{projectId}
```

### Document

```json
{
  "ownerId": "firebase-user-id",
  "charName": "Makima",
  "seriesName": "Chainsaw Man",
  "budget": 5000,
  "status": "planning",
  "note": "รายละเอียด",
  "imageUrl": "",
  "items": [
    {
      "name": "Wig",
      "price": 1200,
      "shopLink": "https://example.com",
      "category": "wig"
    }
  ],
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### Important Rules

- `ownerId` required
- `budget` เป็น number
- `items` เป็น array
- `imageUrl` เป็น URL/string
- `createdAt` เป็น Firestore Timestamp
- `updatedAt` เป็น Firestore Timestamp
- ไม่ใช้ `base64Image`

### Acceptance Criteria

- [ ] schema documented
- [ ] field names stable
- [ ] type ของแต่ละ field ระบุชัด
- [ ] ownership model ชัด

### Deliverable

```text
docs/firestore-schema.md
```

### Suggested Commit

```text
docs: define firestore project schema
```

---

# TASK T09 — Define Status and Shared Constants

### Goal

ลด magic strings

### File

```text
src/utils/constants.js
```

### Code

```javascript
export const PROJECT_STATUS = {
  PLANNING: "planning",
  ACTIVE: "active",
  WAITING: "waiting",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const PROJECT_STATUS_LABELS = {
  planning: "กำลังวางแผน",
  active: "กำลังทำ",
  waiting: "รอดำเนินการ",
  completed: "เสร็จแล้ว",
  cancelled: "ยกเลิก",
};
```

### Acceptance Criteria

- [ ] UI และ service ไม่ประกาศ status ซ้ำ
- [ ] status ใหม่สามารถแก้ที่จุดเดียว

### Suggested Commit

```text
refactor: centralize project constants
```

---

# PHASE 3 — DATA ACCESS LAYER

---

# TASK T10 — Implement `projectService.js`

### Goal

แทนที่ `src/js/api.js` + CRUD ของ `gas/Code.gs`

### File

```text
src/services/projectService.js
```

### Required Functions

```javascript
getProjects(userId)
getProject(projectId)
createProject(userId, data)
updateProject(projectId, data)
deleteProject(projectId)
```

### Base Code

```javascript
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

const projectsRef = collection(db, "projects");

export async function getProjects(userId) {
  const q = query(
    projectsRef,
    where("ownerId", "==", userId),
    orderBy("updatedAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function getProject(projectId) {
  const ref = doc(db, "projects", projectId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    throw new Error("Project not found");
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function createProject(userId, data) {
  const ref = await addDoc(projectsRef, {
    ownerId: userId,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateProject(projectId, data) {
  const ref = doc(db, "projects", projectId);

  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(projectId) {
  await deleteDoc(doc(db, "projects", projectId));
}
```

### Important

Service layer ต้อง:

- ไม่ manipulates DOM
- ไม่เรียก `document.getElementById`
- ไม่แสดง toast
- ไม่ redirect
- ไม่ render UI

### Acceptance Criteria

- [ ] create works
- [ ] list works
- [ ] get works
- [ ] update works
- [ ] delete works
- [ ] service ไม่มี UI logic

### Suggested Commit

```text
feat: add firestore project service
```

---

# TASK T11 — Add Firestore Query Indexes When Needed

### Goal

รองรับ query ที่ใช้:

```text
ownerId == userId
orderBy updatedAt desc
```

### Steps

1. Run app
2. Trigger query
3. ถ้า Firestore แจ้ง missing index ให้สร้าง index
4. เก็บ index config ใน repository

### Deliverable

```text
firestore.indexes.json
```

### Acceptance Criteria

- [ ] project query ทำงานโดยไม่มี runtime index error
- [ ] index config ถูก commit

---

# TASK T12 — Image Upload Service

### Goal

แทน `base64Image`

### File

```text
src/services/storageService.js
```

### Required Functions

```text
uploadProjectImage(file, userId, projectId)
deleteProjectImage(path)
```

### Base Implementation

```javascript
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { storage } from "./firebase";

export async function uploadProjectImage(file, userId, projectId) {
  if (!file.type.startsWith("image/")) {
    throw new Error("กรุณาเลือกไฟล์รูปภาพ");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
  }

  const safeName = `${Date.now()}-${file.name}`;
  const path = `users/${userId}/projects/${projectId}/${safeName}`;

  const fileRef = ref(storage, path);

  await uploadBytes(fileRef, file);

  const url = await getDownloadURL(fileRef);

  return {
    url,
    path,
  };
}
```

### Acceptance Criteria

- [ ] image upload works
- [ ] size validation works
- [ ] type validation works
- [ ] URL can be saved into Firestore
- [ ] no Base64 stored in Firestore

### Suggested Commit

```text
feat: add firebase storage image service
```

---

# TASK T13 — Image Processing Migration

### Goal

นำ useful behavior จาก `src/js/image.js` มาใช้โดยไม่ผูกกับ Base64 database

### Existing Behavior

ปัจจุบัน:

```text
20MB max
resize
canvas
JPEG quality
convert to Base64
```

### New Behavior

```text
Original File
 ↓
Validate
 ↓
Optional resize/compression
 ↓
Blob/File
 ↓
Firebase Storage
```

### File

```text
src/utils/image.js
```

### Rule

Image processing function ควร return:

```text
File / Blob
```

ไม่ควร return Base64 เป็น data model

### Acceptance Criteria

- [ ] resize ยังทำได้
- [ ] quality/compression ยังทำได้
- [ ] storage service รับ File/Blob
- [ ] database ไม่ได้รับ Base64

---

# PHASE 4 — AUTHENTICATION

---

# TASK T14 — Enable Firebase Authentication

### Goal

สร้าง identity system

### Initial Provider

```text
Email / Password
```

### Optional Later

```text
Google
```

### Acceptance Criteria

- [ ] register
- [ ] login
- [ ] logout
- [ ] auth state persistence
- [ ] invalid credentials error

---

# TASK T15 — Create `AuthContext`

### File

```text
src/context/AuthContext.jsx
```

### Code

```jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "../services/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Acceptance Criteria

- [ ] `user` update เมื่อ login/logout
- [ ] refresh แล้ว session ถูกตรวจสอบ
- [ ] loading state แยกจาก unauthenticated state

---

# TASK T16 — Protected Routes

### Goal

ป้องกันหน้าที่ต้อง login

### Files

```text
src/components/auth/ProtectedRoute.jsx
```

### Behavior

```text
Not logged in
    ↓
/login

Logged in
    ↓
requested page
```

### Acceptance Criteria

- [ ] dashboard ไม่เปิดโดยไม่ login
- [ ] create project ไม่เปิดโดยไม่ login
- [ ] detail ไม่เปิดโดยไม่ login
- [ ] login แล้วกลับไป route ที่ต้องการได้

---

# TASK T17 — Login Page

### File

```text
src/pages/Login.jsx
```

### Requirements

```text
Email
Password
Login
Register link
Error
Loading
```

### Acceptance Criteria

- [ ] login success
- [ ] login failure
- [ ] disabled button while submitting
- [ ] validation

---

# TASK T18 — Register Page

### File

```text
src/pages/Register.jsx
```

### Requirements

```text
Email
Password
Confirm Password
Register
Login link
```

### Validation

- email required
- password required
- password confirmation must match
- meaningful errors

---

# PHASE 5 — REACT STATE / FEATURE MIGRATION

---

# TASK T19 — Replace `state.js` With React Hook

### Goal

แทน:

```text
src/js/state.js
```

### New

```text
src/hooks/useProjects.js
```

### Hook API

```javascript
const {
  projects,
  loading,
  error,
  create,
  update,
  remove,
  refresh,
} = useProjects();
```

### Important

ไม่ควรใช้ global mutable object แบบ:

```javascript
window.State
```

### Acceptance Criteria

- [ ] React state เป็น source ของ UI state
- [ ] Firestore เป็น source ของ persisted data
- [ ] localStorage ไม่จำเป็นสำหรับ project database

---

# TASK T20 — Create `useProjects`

### File

```text
src/hooks/useProjects.js
```

### Responsibilities

- fetch projects
- create
- update
- delete
- loading
- error
- refresh

### Pseudocode

```text
useAuth()
   ↓
user.id
   ↓
getProjects(user.id)
   ↓
setProjects()
```

### Acceptance Criteria

- [ ] fetch on authenticated user
- [ ] reset when logout
- [ ] create updates UI
- [ ] update updates UI
- [ ] delete updates UI
- [ ] errors are exposed to page

---

# TASK T21 — Dashboard Page Migration

### Source

```text
src/js/app.js
src/js/ui.js
```

### New

```text
src/pages/Dashboard.jsx
```

### Required components

```text
src/components/dashboard/
├── DashboardHeader.jsx
├── StatsCards.jsx
├── SearchBar.jsx
├── StatusFilter.jsx
├── ProjectGrid.jsx
└── ProjectCard.jsx
```

### Acceptance Criteria

- [ ] projects load
- [ ] stats display
- [ ] search works
- [ ] filter works
- [ ] empty state works
- [ ] loading works
- [ ] error works

---

# TASK T22 — Statistics Calculation

### Goal

ย้าย `getLocalStats()` จาก `app.js`

### Required output

```javascript
{
  total,
  active,
  completed,
  budgetTotal
}
```

### Rule

Pure utility function:

```text
input projects
 ↓
calculate
 ↓
return stats
```

### File

```text
src/utils/projectStats.js
```

### Acceptance Criteria

- [ ] ไม่เรียก Firestore
- [ ] ไม่แก้ state
- [ ] ผลลัพธ์ testable

---

# TASK T23 — Search and Filter Logic

### Goal

ย้าย logic จาก `UI.renderProjects()`

### Search fields

```text
charName
seriesName
note
```

### Filter

```text
status
```

### File

```text
src/utils/projectFilters.js
```

### Function

```javascript
filterProjects(projects, {
  search,
  status,
});
```

### Acceptance Criteria

- [ ] case-insensitive search
- [ ] empty search returns all
- [ ] empty status returns all
- [ ] search + status ทำงานพร้อมกัน

---

# TASK T24 — Create Project Page

### Files

```text
src/pages/CreateProject.jsx

src/components/project/
├── ProjectForm.jsx
├── ImageUploader.jsx
├── ItemList.jsx
├── ItemForm.jsx
└── StatusSelect.jsx
```

### Form State

```text
charName
seriesName
budget
status
note
image
items[]
```

### Flow

```text
Fill form
 ↓
Validate
 ↓
Create Firestore document
 ↓
Get project ID
 ↓
Upload image if selected
 ↓
Update document with imageUrl
 ↓
Navigate to detail/dashboard
```

### Acceptance Criteria

- [ ] create without image
- [ ] create with image
- [ ] create with items
- [ ] validation prevents invalid submit
- [ ] double submit prevented

---

# TASK T25 — Edit Project Flow

### Route

```text
/projects/:id/edit
```

### Flow

```text
Load existing project
 ↓
Populate form
 ↓
Edit
 ↓
Optional replace image
 ↓
Update
 ↓
Return to detail
```

### Acceptance Criteria

- [ ] existing values populate
- [ ] values can be edited
- [ ] image can remain unchanged
- [ ] image can be replaced
- [ ] updatedAt changes

---

# TASK T26 — Project Detail Page

### File

```text
src/pages/ProjectDetail.jsx
```

### Components

```text
ProjectHero.jsx
ProjectInfo.jsx
ProjectStatus.jsx
ProjectNote.jsx
ProjectItems.jsx
```

### Required actions

```text
Back
Edit
Delete
Open shop link
```

### Acceptance Criteria

- [ ] detail loads
- [ ] 404/not-found state
- [ ] image fallback
- [ ] item list
- [ ] shop links
- [ ] edit navigation
- [ ] delete flow

---

# TASK T27 — Item Management

### Goal

รักษา feature เดิมของ `items[]`

### Item model

```json
{
  "name": "Wig",
  "price": 1200,
  "shopLink": "https://...",
  "category": "wig"
}
```

### UI Actions

```text
Add
Edit
Remove
```

### Validation

```text
name required
price >= 0
shopLink optional but must be URL if provided
category optional
```

### Acceptance Criteria

- [ ] multiple items
- [ ] edit item
- [ ] remove item
- [ ] total budget independent from item sum unless explicitly designed otherwise

---

# PHASE 6 — UI REDESIGN

> UI tasks intentionally separate from data migration.

---

# UI-01 — Design System

### Goal

สร้าง visual foundation ก่อนทำแต่ละหน้า

### Files

```text
src/styles/
├── tokens.css
├── globals.css
├── layout.css
└── components.css
```

### Define

```text
colors
font sizes
font weights
spacing
radius
shadows
borders
breakpoints
```

### Acceptance Criteria

- [ ] ไม่มี random color กระจายใน component
- [ ] spacing ใช้ design tokens
- [ ] typography consistent
- [ ] dark/light strategy defined

---

# UI-02 — Global Layout

### Components

```text
src/components/layout/
├── Layout.jsx
├── Header.jsx
├── Sidebar.jsx
└── MobileNav.jsx
```

### Desktop

```text
┌─────────────────────────────────────┐
│ Header                              │
├───────────┬─────────────────────────┤
│ Sidebar   │ Main                    │
│           │                         │
└───────────┴─────────────────────────┘
```

### Mobile

```text
┌──────────────────┐
│ Header           │
├──────────────────┤
│ Main             │
├──────────────────┤
│ Bottom Nav       │
└──────────────────┘
```

### Acceptance Criteria

- [ ] desktop
- [ ] tablet
- [ ] mobile
- [ ] navigation consistent

---

# UI-03 — Dashboard Redesign

### Structure

```text
Dashboard
 ├── Header
 ├── Stats
 ├── Search
 ├── Filter
 ├── Project Grid
 └── Empty State
```

### Requirements

- visual hierarchy
- readable stats
- clear primary action
- responsive project cards

### Acceptance Criteria

- [ ] dashboard is usable without hover
- [ ] keyboard focus visible
- [ ] mobile layout usable
- [ ] no horizontal overflow

---

# UI-04 — Project Card Redesign

### Required Information

```text
image
character
series
status
budget
item count
updated time
actions
```

### States

```text
normal
hover
focus
loading
image missing
long title
long series
```

### Acceptance Criteria

- [ ] card remains readable with long text
- [ ] image has fallback
- [ ] action buttons do not accidentally open card
- [ ] keyboard accessible

---

# UI-05 — Project Form Redesign

### Sections

```text
Character
Image
Budget / Status
Items
Note
Actions
```

### Requirements

- field labels
- validation message
- required indicators
- disabled submit state
- upload progress
- save error

### Acceptance Criteria

- [ ] tab order logical
- [ ] validation visible near field
- [ ] mobile friendly
- [ ] no layout shift during errors

---

# UI-06 — Image Uploader Redesign

### States

```text
empty
drag over
selected
uploading
uploaded
error
replace
remove
```

### Constraints

```text
JPG
PNG
WEBP
max 5MB
```

### Acceptance Criteria

- [ ] preview
- [ ] upload progress
- [ ] error state
- [ ] replace image
- [ ] remove image

---

# UI-07 — Project Detail Redesign

### Layout

```text
Back
Hero Image
Character / Series
Status
Budget
Items
Note
Actions
```

### Acceptance Criteria

- [ ] important information appears first
- [ ] actions easy to find
- [ ] mobile layout readable
- [ ] long notes do not break layout

---

# UI-08 — Modal / Confirmation System

### Components

```text
src/components/common/
├── Modal.jsx
└── ConfirmDialog.jsx
```

### Use Cases

```text
Delete project
Remove item
Replace image
Logout (optional)
```

### Acceptance Criteria

- [ ] escape closes where appropriate
- [ ] focus behavior reasonable
- [ ] destructive action clearly separated
- [ ] click outside behavior defined

---

# UI-09 — Toast System

### Component

```text
src/components/common/Toast.jsx
```

### Types

```text
success
error
warning
info
```

### Examples

```text
บันทึกโปรเจกต์สำเร็จ
อัปโหลดรูปสำเร็จ
เกิดข้อผิดพลาด
ลบโปรเจกต์แล้ว
```

### Acceptance Criteria

- [ ] auto dismiss
- [ ] readable
- [ ] does not block UI
- [ ] accessible enough for important errors

---

# UI-10 — Loading / Empty / Error States

### Components

```text
Loading.jsx
EmptyState.jsx
ErrorMessage.jsx
```

### Required states

```text
Dashboard loading
Dashboard empty
Dashboard error
Detail loading
Detail not found
Detail error
Form submitting
Image uploading
```

### Acceptance Criteria

ทุก async operation ต้องมี feedback

---

# UI-11 — Theme Migration

### Existing Feature

ปัจจุบัน `ui.js` มี:

```text
localStorage cosplay-theme
prefers-color-scheme
data-theme
```

### New

สร้าง:

```text
src/hooks/useTheme.js
```

และ:

```text
src/components/layout/ThemeToggle.jsx
```

### Requirements

- auto detect system theme
- manual toggle
- persist preference
- prevent flash as much as practical

### Acceptance Criteria

- [ ] light
- [ ] dark
- [ ] system preference
- [ ] persistent setting

---

# UI-12 — Responsive & Accessibility Pass

### Breakpoints

```text
390px
768px
1024px
1280px
1440px
```

### Check

```text
keyboard
focus
labels
button states
contrast
text overflow
touch target
horizontal overflow
```

### Acceptance Criteria

- [ ] no horizontal scroll on 390px
- [ ] all interactive controls keyboard reachable
- [ ] form labels connected to inputs
- [ ] visible focus state
- [ ] images have meaningful alt text

---

# PHASE 7 — VALIDATION / SECURITY

---

# TASK T28 — Project Validation

### File

```text
src/utils/validation.js
```

### Rules

```text
charName required
seriesName required
budget >= 0
status must be allowed value
item.name required
item.price >= 0
shopLink valid URL when present
```

### Function

```javascript
export function validateProject(data) {
  const errors = {};

  if (!data.charName?.trim()) {
    errors.charName = "กรุณากรอกชื่อตัวละคร";
  }

  if (!data.seriesName?.trim()) {
    errors.seriesName = "กรุณากรอกชื่อเรื่อง";
  }

  if (Number(data.budget) < 0) {
    errors.budget = "งบประมาณต้องไม่ติดลบ";
  }

  return errors;
}
```

### Acceptance Criteria

- [ ] invalid data blocked
- [ ] useful messages
- [ ] validation shared between create/edit

---

# TASK T29 — Firestore Security Rules

### Goal

User อ่าน/แก้ไขเฉพาะ project ของตัวเอง

### Example

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /projects/{projectId} {

      allow create:
        if request.auth != null
        && request.resource.data.ownerId == request.auth.uid;

      allow read, update, delete:
        if request.auth != null
        && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

### Important

ห้ามใช้:

```javascript
allow read, write: if true;
```

ใน production

### Acceptance Criteria

- [ ] anonymous cannot read project
- [ ] User A cannot read User B project
- [ ] User A cannot update User B project
- [ ] User A cannot delete User B project
- [ ] create requires ownerId matching auth uid

---

# TASK T30 — Storage Security Rules

### Target path

```text
users/{userId}/projects/{fileName}
```

### Rules must enforce

```text
auth.uid == userId
```

และควรตรวจชนิด/ขนาดตามความสามารถของ Storage Rules

### Acceptance Criteria

- [ ] user can upload own image
- [ ] user cannot upload to another user's path
- [ ] anonymous upload denied
- [ ] oversized/unsupported upload handled

---

# TASK T31 — URL / External Link Safety

### Scope

Project item มี:

```text
shopLink
```

### Requirements

- validate URL
- use `https` where appropriate
- external links use safe target behavior
- malformed URLs rejected

### Acceptance Criteria

- [ ] valid URL opens
- [ ] invalid URL blocked
- [ ] no accidental javascript-like URL accepted

---

# PHASE 8 — ERROR HANDLING / UX HARDENING

---

# TASK T32 — Central Error Handling Strategy

### Goal

กำหนด error ที่ user เห็น vs error ที่ developer เห็น

### Pattern

```text
Service error
 ↓
Hook catches / exposes
 ↓
Page decides UI message
 ↓
Toast / ErrorMessage
```

### Rules

ไม่แสดง technical error ยาว ๆ ให้ผู้ใช้โดยตรง เช่น stack trace

### Acceptance Criteria

- [ ] Firebase error mapped to readable message
- [ ] console retains useful developer information
- [ ] user always gets feedback

---

# TASK T33 — Prevent Duplicate Submit

### Scope

Create/Edit form

### State

```javascript
isSubmitting
```

### UI

```text
Saving...
```

### Acceptance Criteria

- [ ] double-click does not create two projects
- [ ] submit button disabled during request
- [ ] state resets on success/failure

---

# TASK T34 — Handle Offline / Network Failure

### Scope

กรณี Firebase request fail

### Required behavior

```text
Request
 ↓
Error
 ↓
Readable message
 ↓
Retry
```

### Acceptance Criteria

- [ ] dashboard network error มี retry
- [ ] create error ไม่ทำให้ form data หาย
- [ ] upload error แจ้งชัดเจน

---

# TASK T35 — Not Found / Invalid Route

### Routes

```text
/
 /projects/new
 /projects/:id
 /projects/:id/edit
```

### Cases

```text
unknown route
missing project
deleted project
malformed id
```

### Acceptance Criteria

- [ ] custom 404 page
- [ ] project not found state
- [ ] no uncaught runtime crash

---

# PHASE 9 — CLEANUP / LEGACY REMOVAL

---

# TASK T36 — Stop Using Legacy API

### Remove references to

```text
window.API
API.list()
API.get()
API.create()
API.update()
API.delete()
GAS_URL
```

### Search command

```bash
grep -R "window.API\|API\.list\|API\.get\|GAS_URL" src index.html
```

### Acceptance Criteria

- [ ] no frontend reference to GAS
- [ ] no GAS URL in source
- [ ] no fetch to Apps Script

---

# TASK T37 — Stop Using Legacy State

### Remove

```text
window.State
localStorage cosplayProjects
State.projects
State.currentEditId
State.currentDetailId
State.tempBase64Image
```

### Important

Theme preference can remain in localStorage if desired.

Project persistence must move to Firestore.

### Acceptance Criteria

- [ ] project CRUD does not use localStorage
- [ ] page reload reads Firestore
- [ ] no stale legacy state controls UI

---

# TASK T38 — Remove Base64 Data Model

### Search

```bash
grep -R "base64Image\|tempBase64Image\|toDataURL" src
```

### Expected

Image processing may still use temporary Blob/File conversion, but project model must use:

```text
imageUrl
```

### Acceptance Criteria

- [ ] Firestore has no Base64 image
- [ ] project object has no `base64Image`
- [ ] storage URL used for display

---

# TASK T39 — Remove Google Apps Script

### Delete after migration is verified

```text
gas/
└── Code.gs
```

### Before deleting

Verify:

```text
Create
Read
Update
Delete
Search
Image
Auth
```

### Acceptance Criteria

- [ ] system still works with gas directory removed
- [ ] no documentation tells developer to deploy GAS

---

# TASK T40 — Remove Old Vanilla UI Code

### Delete after React parity

```text
src/js/app.js
src/js/api.js
src/js/state.js
src/js/ui.js
src/js/image.js
```

### Acceptance Criteria

- [ ] React is only frontend implementation
- [ ] no duplicate UI logic
- [ ] no old DOM event listeners

---

# PHASE 10 — FIREBASE HOSTING

---

# TASK T41 — Configure SPA Hosting

### `firebase.json`

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Why

React Router route:

```text
/projects/123
```

ต้อง refresh แล้ว server ส่ง `index.html`

### Acceptance Criteria

- [ ] `/` works
- [ ] `/projects/new` works
- [ ] `/projects/:id` works
- [ ] direct refresh works
- [ ] unknown path reaches React 404

---

# TASK T42 — Production Build

### Commands

```bash
npm run build
```

### Check

```text
dist/
```

### Must verify

- no missing asset
- no console-breaking error
- environment variables resolved
- production build succeeds

### Acceptance Criteria

```bash
npm run build
```

exit code = 0

---

# TASK T43 — Firebase Deploy

### Deploy

```bash
firebase deploy
```

หรือ:

```bash
firebase deploy --only hosting
```

### After Deploy

ทดสอบ:

```text
homepage
login
dashboard
create
detail
edit
delete
image
logout
refresh
```

### Acceptance Criteria

- [ ] production URL works
- [ ] SPA routes work
- [ ] Firebase services connect
- [ ] no debug/test endpoint remains

---

# PHASE 11 — TESTING

---

# TASK T44 — Manual CRUD Test

## Create

```text
[ ] create minimal project
[ ] create full project
[ ] create with image
[ ] create with items
```

## Read

```text
[ ] dashboard
[ ] detail
[ ] refresh
```

## Update

```text
[ ] edit text
[ ] edit status
[ ] edit budget
[ ] replace image
[ ] edit items
```

## Delete

```text
[ ] cancel delete
[ ] confirm delete
[ ] project disappears
```

---

# TASK T45 — Authentication Test

```text
[ ] register
[ ] duplicate account
[ ] invalid login
[ ] valid login
[ ] logout
[ ] refresh while logged in
[ ] refresh while logged out
```

---

# TASK T46 — Security Test

ต้องทดสอบอย่างน้อย:

```text
User A
 ├── read own project ✅
 ├── update own project ✅
 ├── delete own project ✅
 ├── read User B project ❌
 ├── update User B project ❌
 └── delete User B project ❌
```

### Acceptance Criteria

ผลลัพธ์ security test ต้องบันทึกไว้

```text
docs/security-test.md
```

---

# TASK T47 — Responsive Test

### Test sizes

```text
390px
768px
1024px
1280px
1440px
```

### Check

```text
[ ] no horizontal overflow
[ ] navigation
[ ] dashboard
[ ] cards
[ ] form
[ ] detail
[ ] image upload
[ ] modal
```

---

# TASK T48 — Accessibility Pass

### Check

```text
[ ] keyboard navigation
[ ] focus state
[ ] labels
[ ] alt text
[ ] button semantics
[ ] link semantics
[ ] modal focus
[ ] readable contrast
```

### Acceptance Criteria

- critical actions usable by keyboard
- form controls have associated labels
- image meaning is available via alt text where appropriate

---

# TASK T49 — Performance Pass

### Scope

- image size
- lazy loading
- bundle size
- unnecessary rerenders
- repeated Firestore reads

### Check

```text
[ ] images optimized
[ ] large images not uploaded directly without processing
[ ] project list does not refetch on every keystroke
[ ] React keys stable
[ ] unused dependencies removed
```

---

# PHASE 12 — DOCUMENTATION

---

# TASK T50 — Update README

### README must contain

```text
Project overview
Requirements
Installation
Environment setup
Firebase setup
Development
Build
Deploy
Firestore schema
Storage structure
Security rules
Migration notes
```

### Commands

```bash
npm install
npm run dev
npm run build
firebase deploy
```

---

# TASK T51 — Document Firebase Setup

### File

```text
docs/firebase-setup.md
```

### Include

- Firebase project creation
- Authentication enable
- Firestore enable
- Storage enable
- Hosting initialize
- environment variables
- rules deployment
- indexes

---

# TASK T52 — Document Architecture

### File

```text
docs/architecture.md
```

### Include

```text
React
 ↓
Pages
 ↓
Hooks
 ↓
Services
 ↓
Firebase
```

และ:

```text
Firestore
Storage
Auth
Hosting
```

---

# 3. Dependency Graph

```text
T01
 ↓
T02
 ↓
T03
 ↓
T04
 ↓
T05
 ↓
T06
 ↓
T07
 ↓
T08
 ↓
T09
 ↓
T10 ── T11
 ↓
T12 ── T13
 ↓
T14
 ↓
T15
 ↓
T16
 ↓
T17 ── T18
 ↓
T19
 ↓
T20
 ↓
T21
 ├── T22
 └── T23
 ↓
T24
 ↓
T25
 ↓
T26
 ↓
T27

UI-01
 ↓
UI-02
 ↓
UI-03
 ├── UI-04
 └── UI-05
      ↓
    UI-06
      ↓
    UI-07
      ↓
    UI-08
      ↓
    UI-09
      ↓
    UI-10
      ↓
    UI-11
      ↓
    UI-12

T28
 ↓
T29
 ↓
T30
 ↓
T31
 ↓
T32
 ↓
T33
 ↓
T34
 ↓
T35
 ↓
T36
 ↓
T37
 ↓
T38
 ↓
T39
 ↓
T40
 ↓
T41
 ↓
T42
 ↓
T43
 ↓
T44-T49
 ↓
T50-T52
```

---

# 4. Recommended Milestones

## Milestone M1 — React Boots

Tasks:

```text
T01-T05
```

Result:

```text
React + Vite
Routing
Environment
```

---

## Milestone M2 — Firebase CRUD Works

Tasks:

```text
T06-T13
```

Result:

```text
Firestore CRUD
Storage upload
```

---

## Milestone M3 — Authentication Works

Tasks:

```text
T14-T18
```

Result:

```text
Register
Login
Logout
Protected routes
```

---

## Milestone M4 — Feature Parity

Tasks:

```text
T19-T27
```

Result:

```text
Dashboard
Search
Filter
Create
Edit
Detail
Delete
Items
```

---

## Milestone M5 — New UI

Tasks:

```text
UI-01 → UI-12
```

Result:

```text
New React UI
Responsive
Accessible
Theme
States
```

---

## Milestone M6 — Secure

Tasks:

```text
T28-T35
```

Result:

```text
Validation
Security Rules
Error Handling
Offline/Failure handling
404
```

---

## Milestone M7 — Remove Legacy

Tasks:

```text
T36-T40
```

Result:

```text
No GAS
No Google Sheets
No Base64 database
No Vanilla JS
```

---

## Milestone M8 — Production

Tasks:

```text
T41-T52
```

Result:

```text
Firebase Hosting
Testing
Security verification
Documentation
```

---

# 5. Final Repository

```text
cosplay-planner/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Layout.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MobileNav.jsx
│   │   │   └── ThemeToggle.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.jsx
│   │   │   ├── StatsCards.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── StatusFilter.jsx
│   │   │   ├── ProjectGrid.jsx
│   │   │   └── ProjectCard.jsx
│   │   │
│   │   └── project/
│   │       ├── ProjectForm.jsx
│   │       ├── ProjectHero.jsx
│   │       ├── ProjectInfo.jsx
│   │       ├── ProjectStatus.jsx
│   │       ├── ProjectNote.jsx
│   │       ├── ProjectItems.jsx
│   │       ├── ItemForm.jsx
│   │       ├── ItemList.jsx
│   │       ├── ImageUploader.jsx
│   │       └── StatusSelect.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── CreateProject.jsx
│   │   ├── ProjectDetail.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── NotFound.jsx
│   │
│   ├── services/
│   │   ├── firebase.js
│   │   ├── projectService.js
│   │   └── storageService.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useProjects.js
│   │   └── useTheme.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── validation.js
│   │   ├── projectStats.js
│   │   ├── projectFilters.js
│   │   ├── image.js
│   │   └── formatters.js
│   │
│   ├── styles/
│   │   ├── index.css
│   │   ├── tokens.css
│   │   ├── globals.css
│   │   ├── layout.css
│   │   └── components.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── docs/
│   ├── legacy-behavior.md
│   ├── firestore-schema.md
│   ├── firebase-setup.md
│   ├── architecture.md
│   └── security-test.md
│
├── .env
├── .env.example
├── .gitignore
├── firebase.json
├── firestore.rules
├── storage.rules
├── firestore.indexes.json
├── package.json
└── README.md
```

---

# 6. Legacy → New Mapping

| Legacy | New |
|---|---|
| `index.html` markup | React components |
| `app.js:init()` | `App.jsx` + providers |
| `app.js:loadDashboard()` | `Dashboard.jsx` + `useProjects()` |
| `app.js:getProjects()` | `projectService.getProjects()` |
| `app.js:getLocalStats()` | `projectStats.js` |
| `app.js:handleSearch()` | `projectFilters.js` + React state |
| `app.js:handleFilter()` | `projectFilters.js` + React state |
| `app.js:createNewProject()` | route `/projects/new` |
| `app.js:populateForm()` | `ProjectForm.jsx` |
| `api.js:list()` | `projectService.getProjects()` |
| `api.js:get()` | `projectService.getProject()` |
| `api.js:create()` | `projectService.createProject()` |
| `api.js:update()` | `projectService.updateProject()` |
| `api.js:delete()` | `projectService.deleteProject()` |
| `state.js.projects` | React state from `useProjects()` |
| `state.js.localStorage` | Firestore |
| `state.js.tempBase64Image` | component-local File/Blob state |
| `ui.js:renderProjects()` | `ProjectGrid` + `ProjectCard` |
| `ui.js:renderItems()` | `ProjectItems` |
| `ui.js:showToast()` | `Toast` |
| `ui.js:showLoading()` | `Loading` |
| `ui.js:switchView()` | React Router |
| `image.js` | `utils/image.js` + `storageService.js` |
| `Code.gs:listProjects()` | `projectService.getProjects()` |
| `Code.gs:getProjectById()` | `projectService.getProject()` |
| `Code.gs:createProject()` | `projectService.createProject()` |
| `Code.gs:updateProject()` | `projectService.updateProject()` |
| `Code.gs:deleteProject()` | `projectService.deleteProject()` |
| `Code.gs:searchProjects()` | client filter first; Firestore query later if needed |

---

# 7. Final End-to-End Flow

```text
User
 ↓
React
 ↓
AuthContext
 ↓
Protected Route
 ↓
Page
 ↓
Custom Hook
 ↓
Service
 ↓
Firebase SDK
 ├── Firestore
 ├── Storage
 └── Auth
```

## Create Project

```text
ProjectForm
 ↓
validateProject()
 ↓
createProject()
 ↓
Firestore creates document
 ↓
projectId returned
 ↓
uploadProjectImage()
 ↓
Storage returns URL
 ↓
updateProject()
 ↓
imageUrl saved
 ↓
navigate('/projects/:id')
```

## Read Project

```text
Route
 ↓
ProjectDetail
 ↓
getProject(id)
 ↓
Firestore
 ↓
render
```

## Edit

```text
load project
 ↓
ProjectForm
 ↓
validate
 ↓
update Firestore
 ↓
optional image replacement
 ↓
detail
```

## Delete

```text
Delete button
 ↓
ConfirmDialog
 ↓
deleteProject()
 ↓
refresh/remove local state
 ↓
Dashboard
```

---

# 8. Final Definition of Done

Project ถือว่า migrated เสร็จเมื่อ:

## Frontend

```text
[ ] React + Vite
[ ] React Router
[ ] No legacy DOM rendering
[ ] Responsive UI
[ ] Design System
```

## Data

```text
[ ] Firestore
[ ] ownerId
[ ] CRUD
[ ] timestamps
[ ] validation
```

## Images

```text
[ ] Firebase Storage
[ ] imageUrl
[ ] no Base64 database
[ ] upload validation
```

## Auth

```text
[ ] Register
[ ] Login
[ ] Logout
[ ] Protected routes
```

## Security

```text
[ ] Firestore Rules
[ ] Storage Rules
[ ] per-user ownership
```

## UX

```text
[ ] Loading
[ ] Empty
[ ] Error
[ ] Toast
[ ] Confirm dialog
[ ] Responsive
[ ] Theme
```

## Legacy Removal

```text
[ ] GAS removed
[ ] Google Sheets removed
[ ] Vanilla JS removed
[ ] legacy project localStorage removed
```

## Deploy

```text
[ ] Build succeeds
[ ] Firebase Hosting works
[ ] SPA routes refresh correctly
[ ] Production smoke test passes
```

---

# 9. Suggested Git Commit Sequence

แนะนำให้ commit ตาม milestone เพื่อ rollback ง่าย:

```text
chore: document legacy behavior
chore: prepare migration branch
chore: establish react structure
feat: bootstrap react vite app
chore: add environment configuration
feat: configure firebase
docs: define firestore schema
feat: add firestore project service
feat: add firebase storage service
feat: add authentication
feat: add protected routes
feat: add project hooks
feat: migrate dashboard
feat: migrate project form
feat: migrate project detail
feat: add item management
feat: add design system
feat: redesign dashboard
feat: redesign project form
feat: redesign project detail
feat: add responsive layout
feat: add security rules
feat: add error handling
refactor: remove legacy api
refactor: remove legacy state
refactor: remove base64 image model
refactor: remove google apps script
refactor: remove vanilla js
chore: configure firebase hosting
test: run production smoke tests
docs: update architecture and setup
```

---

# 10. Recommended Execution Rule

อย่าทำ:

```text
React + Firebase + UI redesign + Auth + Security
ทั้งหมดใน commit เดียว
```

ให้ทำ:

```text
Foundation
 ↓
Data
 ↓
Auth
 ↓
Feature parity
 ↓
UI redesign
 ↓
Security
 ↓
Cleanup
 ↓
Deploy
```

และหลังจบแต่ละ milestone ให้หยุดแล้วตรวจ acceptance criteria ก่อนเริ่ม milestone ถัดไป

