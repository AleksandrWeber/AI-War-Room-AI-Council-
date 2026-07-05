import { describe, expect, it } from 'vitest'
import {
  buildObservabilityAdminStats,
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
