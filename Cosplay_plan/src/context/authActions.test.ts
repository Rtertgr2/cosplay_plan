import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import {
  changeEmail,
  changePassword,
  registerWithDisplayName,
  updateDisplayName,
} from './authActions'

/**
 * T1/T2 — logic ของบัญชีทั้งหมดอยู่ที่นี่ (เรียก Firebase SDK ตรง ๆ)
 * ทดสอบตรงนี้ไม่ต้อง render React — mock เฉพาะขอบเขตที่พูดถึง Firebase
 */

/** auth.currentUser ต้องกลับค่าได้ระหว่างเทสต์ → ใช้ getter */
const state = vi.hoisted(() => ({
  currentUser: { uid: 'u1', email: 'old@example.com' } as { uid: string; email: string } | null,
  /** ลำดับการถูกเรียก — ใช้ยืนยันว่า re-auth เกิดก่อนการเปลี่ยนข้อมูลเสมอ */
  calls: [] as string[],
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(async () => {
    state.calls.push('create')
    return { user: { uid: 'u1' } }
  }),
  updateProfile: vi.fn(async () => {
    state.calls.push('updateProfile')
  }),
  updateEmail: vi.fn(async () => {
    state.calls.push('updateEmail')
  }),
  updatePassword: vi.fn(async () => {
    state.calls.push('updatePassword')
  }),
  reauthenticateWithCredential: vi.fn(async () => {
    state.calls.push('reauth')
  }),
  EmailAuthProvider: {
    credential: (email: string, password: string) => ({ email, password }),
  },
}))

vi.mock('../services/firebase', () => ({
  auth: {
    get currentUser() {
      return state.currentUser
    },
  },
}))

describe('registerWithDisplayName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.calls.length = 0
    state.currentUser = { uid: 'u1', email: 'old@example.com' }
  })

  it('สร้างบัญชีแล้วบันทึกชื่อลงโปรไฟล์ผู้ใช้', async () => {
    await registerWithDisplayName('a@b.co', 'pw123', 'เรม')

    expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1)
    expect(updateProfile).toHaveBeenCalledWith({ uid: 'u1' }, { displayName: 'เรม' })
  })

  it('ตัดช่องว่างหัวหน้าก่อนบันทึก', async () => {
    await registerWithDisplayName('a@b.co', 'pw123', '  ฮัตสึเนะ  ')

    expect(updateProfile).toHaveBeenCalledWith({ uid: 'u1' }, { displayName: 'ฮัตสึเนะ' })
  })

  it('ไม่ส่งชื่อมา → ไม่เรียก updateProfile (ผู้สมัครแบบเดิมยังใช้ได้)', async () => {
    await registerWithDisplayName('a@b.co', 'pw123')

    expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1)
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('ชื่อว่างเปล่า → ไม่เรียก updateProfile', async () => {
    await registerWithDisplayName('a@b.co', 'pw123', '   ')

    expect(updateProfile).not.toHaveBeenCalled()
  })
})

describe('updateDisplayName (หน้า Settings)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.calls.length = 0
    state.currentUser = { uid: 'u1', email: 'old@example.com' }
  })

  it('บันทึกชื่อใหม่ (ตัดช่องว่างหัวหน้าก่อน)', async () => {
    await updateDisplayName('  ฮัตสึเนะ  ')

    expect(updateProfile).toHaveBeenCalledWith(
      state.currentUser,
      { displayName: 'ฮัตสึเนะ' },
    )
  })

  it('ส่งชื่อว่างเพื่อ "ล้างชื่อ" ได้ (Header จะตกไปใช้อีเมลแทน)', async () => {
    await updateDisplayName('   ')

    expect(updateProfile).toHaveBeenCalledWith(state.currentUser, { displayName: '' })
  })

  it('ยังไม่ล็อกอิน → throw ข้อความไทย ไม่ยิง SDK', async () => {
    state.currentUser = null

    await expect(updateDisplayName('เรม')).rejects.toThrow('ยังไม่ได้เข้าสู่ระบบ')
    expect(updateProfile).not.toHaveBeenCalled()
  })
})

describe('changeEmail (หน้า Settings)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.calls.length = 0
    state.currentUser = { uid: 'u1', email: 'old@example.com' }
  })

  it('ยืนยันตัวตน (re-auth) ก่อนเปลี่ยนอีเมลเสมอ', async () => {
    await changeEmail('pw123', 'new@example.com')

    expect(state.calls).toEqual(['reauth', 'updateEmail'])
  })

  it('ยืนยันตัวตนด้วยอีเมลของบัญชี + รหัสปัจจุบันที่กรอกมา', async () => {
    await changeEmail('pw123', 'new@example.com')

    expect(reauthenticateWithCredential).toHaveBeenCalledWith(
      state.currentUser,
      { email: 'old@example.com', password: 'pw123' },
    )
  })

  it('ตัดช่องว่างอีเมลใหม่ก่อนบันทึก', async () => {
    await changeEmail('pw123', '  new@example.com  ')

    expect(updateEmail).toHaveBeenCalledWith(state.currentUser, 'new@example.com')
  })

  it('re-auth ไม่ผ่าน → ไม่เปลี่ยนอีเมล (error ต้องหลุดออกมาให้หน้าแสดง)', async () => {
    vi.mocked(reauthenticateWithCredential).mockRejectedValueOnce({
      code: 'auth/wrong-password',
    })

    await expect(changeEmail('ผิด', 'new@example.com')).rejects.toMatchObject({
      code: 'auth/wrong-password',
    })
    expect(updateEmail).not.toHaveBeenCalled()
  })

  it('ยังไม่ล็อกอิน → throw ข้อความไทย', async () => {
    state.currentUser = null

    await expect(changeEmail('pw123', 'new@example.com')).rejects.toThrow('ยังไม่ได้เข้าสู่ระบบ')
  })
})

describe('changePassword (หน้า Settings)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.calls.length = 0
    state.currentUser = { uid: 'u1', email: 'old@example.com' }
  })

  it('ยืนยันตัวตนก่อนเปลี่ยนรหัสผ่านเสมอ', async () => {
    await changePassword('old123', 'new123456')

    expect(state.calls).toEqual(['reauth', 'updatePassword'])
  })

  it('ส่งรหัสผ่านใหม่ตามที่กรอก', async () => {
    await changePassword('old123', 'new123456')

    expect(updatePassword).toHaveBeenCalledWith(state.currentUser, 'new123456')
  })

  it('re-auth ไม่ผ่าน → ไม่เปลี่ยนรหัสผ่าน', async () => {
    vi.mocked(reauthenticateWithCredential).mockRejectedValueOnce({
      code: 'auth/wrong-password',
    })

    await expect(changePassword('ผิด', 'new123456')).rejects.toMatchObject({
      code: 'auth/wrong-password',
    })
    expect(updatePassword).not.toHaveBeenCalled()
  })

  it('ยังไม่ล็อกอิน → throw ข้อความไทย', async () => {
    state.currentUser = null

    await expect(changePassword('old123', 'new123456')).rejects.toThrow('ยังไม่ได้เข้าสู่ระบบ')
  })
})
