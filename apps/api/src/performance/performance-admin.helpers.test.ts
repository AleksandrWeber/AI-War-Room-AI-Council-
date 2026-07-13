import { describe, expect, it } from 'vitest'
import {
  buildPerformanceAdminRecords,
  buildPerformanceAdminStats,
  getPerformanceAdminGuidance,
  rankSlowestPipelinePhases,
  resolvePerformanceAdminActions,
} from './performance-admin.helpers.js'

describe('performance admin helpers', () => {
  it('builds performance admin records and stats', () => {
    const records = buildPerformanceAdminRecords([
      {
        domain: 'completed_runs',
        tableName: 'runs',
        recordCount: 8,
        tableExists: true,
      },
      {
        domain: 'pipeline_latency_events',
        tableName: 'observability_buffer',
        recordCount: 4,
        tableExists: true,
      },
    ])

    const stats = buildPerformanceAdminStats({
      records,
      postgresConnectivity: true,
      pipelineEventCount: 5,
      latencyEventCount: 4,
      averageLatencyMs: 250,
      slowestPipelinePhases: [
        { phase: 'persistence', durationMs: 800, runId: 'run_1' },
      ],
    })

    expect(records).toHaveLength(2)
    expect(stats).toMatchObject({
      totalRecords: 12,
      coveredDomains: 2,
      averageLatencyMs: 250,
      latencySignalPercent: 80,
      slowestPipelinePhases: [
        { phase: 'persistence', durationMs: 800, runId: 'run_1' },
      ],
    })
  })

  it('ranks the slowest pipeline phases by duration', () => {
    expect(
      rankSlowestPipelinePhases([
        {
          eventName: 'pipeline_phase_completed',
          attributes: {
            phase: 'artifacts',
            durationMs: 200,
            runId: 'run_a',
          },
        },
        {
          eventName: 'pipeline_quota_check_completed',
          attributes: { durationMs: 900 },
        },
        {
          eventName: 'pipeline_phase_completed',
          attributes: {
            phase: 'persistence',
            durationMs: 800,
            runId: 'run_b',
          },
        },
      ]),
    ).toEqual([
      { phase: 'persistence', durationMs: 800, runId: 'run_b' },
      { phase: 'artifacts', durationMs: 200, runId: 'run_a' },
    ])
  })

  it('returns guidance and actions', () => {
    expect(
      getPerformanceAdminGuidance({
        stats: {
          totalRecords: 0,
          coveredDomains: 0,
          totalDomains: 4,
          postgresConnectivity: false,
          averageLatencyMs: 0,
          latencySignalPercent: 100,
          slowestPipelinePhases: [],
        },
      }),
    ).toContain('PostgreSQL connectivity')

    expect(resolvePerformanceAdminActions()).toEqual([
      'refresh_performance_summary',
    ])
  })
})
