# Firestore Schema — Cosplay Planner

> สร้าง: 2026-09-29 (T08) · ใช้กับ Firestore database `cosplay-plan` (STANDARD edition)
> เทียบกับ `docs/legacy-behavior.md` แล้ว — field เดิมครบ ไม่ตกหล่น

---

## 1. Collection: `projects`

```text
projects/{projectId}
```

`projectId` = Firestore auto-ID (หรือสร้างเอง) — ใช้เป็น document ID

### Document Schema

| Field | Type | Required | หมายเหตุ |
|---|---|---|---|
| `ownerId` | `string` | ✅ | Firebase Auth uid ของเจ้าของ — ใช้กับ security rules |
| `charName` | `string` | ✅ | ชื่อตัวละคร |
| `seriesName` | `string` | | ชื่อซีรีส์ |
| `budget` | `number` | | งบประมาณ (บาท) — เป็น number เสมอ ไม่ใช่ string |
| `status` | `string` | ✅ | enum: `planning` \| `active` \| `waiting` \| `completed` \| `cancelled` |
| `note` | `string` | | บันทึกย่อ |
| `imageUrl` | `string` | | URL ของรูปภาพ (Firebase Storage) — **ไม่ใช่ base64** |
| `items` | `array<Item>` | | รายการสินค้า |
| `createdAt` | `Timestamp` | ✅ | สร้างเมื่อ |
| `updatedAt` | `Timestamp` | ✅ | แก้ไขล่าสุด |

### Item Schema (subdocument ใน `items[]`)

| Field | Type | Required | หมายเหตุ |
|---|---|---|---|
| `name` | `string` | ✅ | ชื่อสินค้า |
| `price` | `number` | | ราคา (บาท) |
| `shopLink` | `string` | | URL ร้านค้า — ต้อง validate (T31) |
| `category` | `string` | | หมวดหมู่ — ค่าไทย: `วิก` \| `ชุด` \| `พร็อพ` \| `รองเท้า` |

---

## 2. ตัวอย่าง Document JSON

```json
{
  "ownerId": "abc123uid",
  "charName": "Rem",
  "seriesName": "Re:Zero",
  "budget": 15000,
  "status": "active",
  "note": "สั่งวิกแล้ว รอชุด",
  "imageUrl": "https://firebasestorage.googleapis.com/v0/b/cosplay-plan.firebasestorage.app/o/users%2Fabc123uid%2Fprojects%2Fproj_123%2F1695000000000-rem.jpg",
  "items": [
    {
      "name": "วิก Rem สีฟ้า",
      "price": 3500,
      "shopLink": "https://example.com/shop/wig",
      "category": "วิก"
    },
    {
      "name": "ชุดเกราะ",
      "price": 8000,
      "shopLink": "",
      "category": "ชุด"
    }
  ],
  "createdAt": "2026-09-29T10:00:00.000Z",
  "updatedAt": "2026-09-29T10:00:00.000Z"
}
```

---

## 3. กฎสำคัญ (Rules)

| กฎ | เหตุผล |
|---|---|
| **ไม่มี `base64Image`** | รูปเก็บใน Storage ไม่ใช่ Firestore — ป้องกัน doc ใหญ่ |
| **`ownerId` required ทุก doc** | ใช้กับ security rules — แก้ไขได้เฉพาะของตัวเอง |
| **`budget` เป็น number เสมอ** | ป้องกัน string ทำให้ sort/คำนวณผิด |
| **`status` เป็น enum** | ค่าคงที่ 5 ค่า — ไม่ใช่ free text |
| **`imageUrl` เป็น string (URL)** | ว่าง = ไม่มีรูป — ไม่ต้องใช้ `hasImage` field |

---

## 4. Indexes

| Query | Index ที่ต้องมี | สถานะ |
|---|---|---|
| `where("ownerId","==",uid) + orderBy("updatedAt","desc")` | composite: `ownerId ASC` + `updatedAt DESC` | มีใน `firestore.indexes.json` (T11) |

---

## 5. เทียบกับ Legacy (field mapping)

| Legacy (Sheets) | Firestore | เปลี่ยน? |
|---|---|---|
| `ProjectID` | doc ID (`projectId`) | ✅ ใช้ auto-ID |
| `Character` | `charName` | — |
| `Series` | `seriesName` | — |
| `Budget` | `budget` | — |
| `Status` | `status` | — |
| `Note` | `note` | — |
| `Items_JSON` | `items` (array) | ✅ ไม่ใช่ JSON string |
| `Base64_Image` | `imageUrl` (URL) | ✅ **เปลี่ยนจาก base64** |
| `CreatedAt` | `createdAt` (Timestamp) | ✅ เปลี่ยนเป็น Timestamp |
| `UpdatedAt` | `updatedAt` (Timestamp) | ✅ เปลี่ยนเป็น Timestamp |
| `hasImage` | ❌ ไม่ใช้ | ✅ imageUrl ว่าง = ไม่มีรูป |
| — | `ownerId` | ✅ **เพิ่มใหม่** (auth) |

### Item mapping

| Legacy | Firestore | เปลี่ยน? |
|---|---|---|
| `name` | `name` | — |
| `price` | `price` | — |
| `shopLink` | `shopLink` | — |
| `category` | `category` | ค่าไทยเดิม: `วิก`/`ชุด`/`พร็อพ`/`รองเท้า` |

---

## 6. สิ่งที่ต้องตัดสินใจ (จาก memory.md)

| หัวข้อ | ตัดสินใจแล้ว |
|---|---|
| `category` | คงภาษาไทย (`วิก`/`ชุด`/`พร็อพ`/`รองเท้า`) |
| `status` label | เก็บ emoji ใน constants (UI layer) |
| `imageUrl` | เป็น URL จาก Storage (Plan B: ยังไม่ใช้ Storage จริง) |

---

*สร้าง: 2026-09-29 (T08)*
