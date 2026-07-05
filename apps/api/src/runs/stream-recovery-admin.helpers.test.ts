import { describe, expect, it } from 'vitest'
import {
  buildStreamRecoveryAdminStats,
  resolveStreamRecoveryAdminActions,
  toStreamRecoveryAdminRecord,
} from './stream-recovery-admin.helpers.js'

describe('stream recovery admin helpers', () => {
  it('builds stream recovery stats', () => {
    expect(
      buildStreamRecoveryAdminStats([
        {
          runId: 'run_1',
          eventCount: 3,
          lastEventType: 'status',
          terminal: false,
        },
        {
          runId: 'run_2',
          eventCount: 2,
          lastEventType: 'completed',
          terminal: true,
        },
      ]),
    ).toMatchObject({
      bufferedRunCount: 2,
      totalBufferedEvents: 5,
      terminalRunCount: 1,
      activeRunCount: 1,
      replayReadyRunCount: 2,
    })
  })

  it('maps buffered stream summaries to admin records', () => {
    expect(
      toStreamRecoveryAdminRecord({
        runId: 'run_1',
        eventCount: 1,
        lastEvent: {
          eventId: 'event_1',
          type: 'completed',
          result: {} as never,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      }),
    ).toMatchObject({
      runId: 'run_1',
      lastEventType: 'completed',
      terminal: true,
    })
  })

  it('offers clear action when buffered runs exist', () => {
    expect(
      resolveStreamRecoveryAdminActions({
        stats: buildStreamRecoveryAdminStats([
          {
            runId: 'run_1',
            eventCount: 1,
            lastEventType: 'status',
            terminal: false,
          },
        ]),
      }),
    ).toEqual([
      'refresh_stream_recovery_summary',
      'clear_workspace_stream_buffers',
    ])
  })
})
