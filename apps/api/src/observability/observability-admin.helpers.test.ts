import { describe, expect, it } from 'vitest'
import {
  STREAM_LAG_WARNING_MS,
  buildObservabilityAdminStats,
  buildObservabilityAlerts,
  getObservabilityAdminGuidance,
  resolveObservabilityAdminActions,
  toObservabilityAdminEvents,
} from './observability-admin.helpers.js'

describe('observability admin helpers', () => {
  it('builds observability stats from events', () => {
    expect(
      buildObservabilityAdminStats([
        {
          eventName: 'pipeline_phase_completed',
          level: 'info',
          timestamp: '2026-01-01T00:00:00.000Z',
        },
        {
          eventName: 'llm_call_completed',
          level: 'error',
          timestamp: '2026-01-01T00:00:01.000Z',
        },
      ]),
    ).toMatchObject({
      totalEvents: 2,
      errorEvents: 1,
      pipelinePhaseEvents: 1,
      llmEvents: 1,
    })
  })

  it('builds worker, stream lag, and provider failure alerts', () => {
    const nowMs = Date.parse('2026-01-01T00:02:00.000Z')

    expect(
      buildObservabilityAlerts({
        workspaceId: 'workspace_1',
        nowMs,
        temporalEnabled: true,
        temporalHealthy: false,
        temporalGuidance: 'Temporal worker is not polling.',
        streamSummaries: [
          {
            runId: 'run_lagging',
            lastEventAt: '2026-01-01T00:00:00.000Z',
            terminal: false,
          },
        ],
        recentEvents: [
          {
            eventName: 'llm_provider_failure',
            level: 'error',
            timestamp: '2026-01-01T00:01:00.000Z',
            attributes: {
              workspaceId: 'workspace_1',
            },
          },
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        type: 'worker_health',
        severity: 'critical',
      }),
      expect.objectContaining({
        type: 'stream_lag',
        severity: 'warning',
        message: expect.stringContaining(`${STREAM_LAG_WARNING_MS / 1000}s`),
      }),
      expect.objectContaining({
        type: 'provider_failure',
        severity: 'warning',
      }),
    ])
  })

  it('offers buffer clear when events exist', () => {
    expect(
      resolveObservabilityAdminActions({
        stats: buildObservabilityAdminStats([
          {
            eventName: 'shield_scan_completed',
            level: 'info',
            timestamp: '2026-01-01T00:00:00.000Z',
          },
        ]),
      }),
    ).toEqual(['refresh_event_summary', 'clear_observability_buffer'])
  })

  it('maps recent events for admin display', () => {
    expect(
      toObservabilityAdminEvents([
        {
          eventName: 'pipeline_phase_completed',
          level: 'info',
          timestamp: '2026-01-01T00:00:00.000Z',
          attributes: {
            workspaceId: 'workspace_1',
            runId: 'run_test',
            success: true,
          },
        },
      ]),
    ).toEqual([
      {
        eventName: 'pipeline_phase_completed',
        level: 'info',
        timestamp: '2026-01-01T00:00:00.000Z',
        runId: 'run_test',
      },
    ])
  })

  it('guides admins when errors exist', () => {
    expect(
      getObservabilityAdminGuidance({
        stats: buildObservabilityAdminStats([
          {
            eventName: 'pipeline_phase_completed',
            level: 'error',
            timestamp: '2026-01-01T00:00:00.000Z',
          },
        ]),
      }),
    ).toContain('error events')
  })
})
