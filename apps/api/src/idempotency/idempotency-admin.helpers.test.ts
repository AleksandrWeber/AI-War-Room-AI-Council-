import { describe, expect, it } from 'vitest'
import {
  buildIdempotencyAdminRecords,
  buildIdempotencyAdminStats,
  resolveIdempotencyAdminActions,
} from './idempotency-admin.helpers.js'

describe('idempotency admin helpers', () => {
  it('merges persisted keys and active reservations', () => {
    expect(
      buildIdempotencyAdminRecords({
        persistedRecords: [
          {
            idempotencyKey: 'idem_1',
            runId: 'run_1',
            expiresAt: '2026-01-02T00:00:00.000Z',
            expired: false,
          },
        ],
        activeReservations: [{ idempotencyKey: 'idem_2' }],
      }),
    ).toEqual([
      expect.objectContaining({
        idempotencyKey: 'idem_1',
        reservationActive: false,
      }),
      expect.objectContaining({
        idempotencyKey: 'idem_2',
        reservationActive: true,
      }),
    ])
  })

  it('offers clear action when active reservations exist', () => {
    const stats = buildIdempotencyAdminStats([
      {
        idempotencyKey: 'idem_1',
        reservationActive: true,
        expired: false,
      },
    ])

    expect(resolveIdempotencyAdminActions({ stats })).toEqual([
      'refresh_idempotency_summary',
      'clear_workspace_idempotency_reservations',
    ])
  })
})
