import { describe, expect, it, vi } from 'vitest'
import { settleAbortable } from './settleAbortable.js'

describe('settleAbortable', () => {
  it('writes resolved values when the signal is active', async () => {
    const onValue = vi.fn()
    const controller = new AbortController()

    settleAbortable(controller.signal, Promise.resolve({ ok: true }), onValue)
    await Promise.resolve()

    expect(onValue).toHaveBeenCalledWith({ ok: true })
  })

  it('writes null when the promise rejects', async () => {
    const onValue = vi.fn()
    const controller = new AbortController()

    settleAbortable(controller.signal, Promise.reject(new Error('boom')), onValue)
    await Promise.resolve()
    await Promise.resolve()

    expect(onValue).toHaveBeenCalledWith(null)
  })

  it('skips writes after abort', async () => {
    const onValue = vi.fn()
    const controller = new AbortController()
    controller.abort()

    settleAbortable(controller.signal, Promise.resolve('late'), onValue)
    await Promise.resolve()

    expect(onValue).not.toHaveBeenCalled()
  })
})
