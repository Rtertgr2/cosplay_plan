import { afterEach, describe, expect, it, vi } from 'vitest'
import { uploadProjectImage } from './storageService'

/**
 * storageService — ImgBB upload (TDD)
 *
 * ครอบ matrix: validation ฝั่ง client (ชนิด/svg/ขนาด) + error mapping ไทย
 * + การแปลสถานะ HTTP ของ ImgBB (401/400 key/429/network/success ปลอม)
 */

const KEY = 'test-imgbb-key'

function makeFile(type: string, bytes = 1024): File {
  return new File([new Uint8Array(bytes)], 'test.png', { type })
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('uploadProjectImage (ImgBB)', () => {
  it('uploads and returns direct url', async () => {
    vi.stubEnv('VITE_IMGBB_API_KEY', KEY)
    const url = 'https://i.ibb.co/abc/test.png'
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ success: true, status: 200, data: { url } }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await uploadProjectImage(makeFile('image/png'), 'proj1')

    expect(result).toBe(url)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [endpoint, init] = fetchMock.mock.calls[0]
    expect(String(endpoint)).toContain('https://api.imgbb.com/1/upload')
    expect(String(endpoint)).toContain(`key=${KEY}`)
    expect(init.method).toBe('POST')
    expect(init.body).toBeInstanceOf(FormData)
  })

  it('rejects when VITE_IMGBB_API_KEY missing', async () => {
    vi.stubEnv('VITE_IMGBB_API_KEY', '')
    await expect(uploadProjectImage(makeFile('image/png'), 'p')).rejects.toMatchObject({
      code: 'imgbb/missing-key',
    })
  })

  it('rejects non-image file type', async () => {
    vi.stubEnv('VITE_IMGBB_API_KEY', KEY)
    await expect(
      uploadProjectImage(makeFile('application/pdf'), 'p'),
    ).rejects.toMatchObject({ code: 'imgbb/invalid-file' })
  })

  it('rejects svg (scriptable image)', async () => {
    vi.stubEnv('VITE_IMGBB_API_KEY', KEY)
    await expect(
      uploadProjectImage(makeFile('image/svg+xml'), 'p'),
    ).rejects.toMatchObject({ code: 'imgbb/invalid-file' })
  })

  it('rejects file > 5MB', async () => {
    vi.stubEnv('VITE_IMGBB_API_KEY', KEY)
    const big = makeFile('image/jpeg', 5 * 1024 * 1024 + 1)
    await expect(uploadProjectImage(big, 'p')).rejects.toMatchObject({
      code: 'imgbb/invalid-file',
    })
  })

  it('maps 401 to imgbb/unauthorized', async () => {
    vi.stubEnv('VITE_IMGBB_API_KEY', KEY)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 401)))
    await expect(uploadProjectImage(makeFile('image/png'), 'p')).rejects.toMatchObject({
      code: 'imgbb/unauthorized',
    })
  })

  it('maps 400 "Invalid API key" to imgbb/unauthorized', async () => {
    vi.stubEnv('VITE_IMGBB_API_KEY', KEY)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          { status_code: 400, error: { message: 'Invalid API v1 key.', code: 100 } },
          400,
        ),
      ),
    )
    await expect(uploadProjectImage(makeFile('image/png'), 'p')).rejects.toMatchObject({
      code: 'imgbb/unauthorized',
    })
  })

  it('maps 429 to imgbb/rate-limit', async () => {
    vi.stubEnv('VITE_IMGBB_API_KEY', KEY)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 429)))
    await expect(uploadProjectImage(makeFile('image/png'), 'p')).rejects.toMatchObject({
      code: 'imgbb/rate-limit',
    })
  })

  it('maps network failure to imgbb/network', async () => {
    vi.stubEnv('VITE_IMGBB_API_KEY', KEY)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    await expect(uploadProjectImage(makeFile('image/png'), 'p')).rejects.toMatchObject({
      code: 'imgbb/network',
    })
  })

  it('maps 200 without success/url to imgbb/failed', async () => {
    vi.stubEnv('VITE_IMGBB_API_KEY', KEY)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ success: false }, 200)))
    await expect(uploadProjectImage(makeFile('image/png'), 'p')).rejects.toMatchObject({
      code: 'imgbb/failed',
    })
  })
})
