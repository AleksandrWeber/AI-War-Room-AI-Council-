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

  it('offers clear and purge actions when reservations or expired keys exist', () => {
    expect(
      resolveIdempotencyAdminActions({
        stats: buildIdempotencyAdminStats([
          {
            idempotencyKey: 'idem_1',
            reservationActive: true,
            expired: false,
          },
        ]),
      }),
    ).toEqual([
      'refresh_idempotency_summary',
      'clear_workspace_idempotency_reservations',
    ])

    expect(
      resolveIdempotencyAdminActions({
        stats: buildIdempotencyAdminStats([
          {
            idempotencyKey: 'idem_expired',
            reservationActive: false,
            expired: true,
          },
        ]),
      }),
    ).toEqual([
      'refresh_idempotency_summary',
      'purge_expired_idempotency_keys',
    ])
  })
})
