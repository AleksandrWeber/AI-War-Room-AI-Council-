import { describe, expect, it } from 'vitest'
import {
  buildRunHistoryAdminStats,
  buildRunHistoryExportResponse,
  serializeRunHistoryCsv,
} from './run-history-admin.helpers.js'

describe('run history admin helpers', () => {
  it('builds run history stats', () => {
    expect(
      buildRunHistoryAdminStats([
        {
          artifactId: 'artifact_1',
          runId: 'run_1',
          artifactType: 'executive_summary',
          artifactVersion: 'v1',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          artifactId: 'artifact_2',
          runId: 'run_1',
          artifactType: 'prd',
          artifactVersion: 'v1',
          createdAt: '2026-01-01T00:00:01.000Z',
        },
      ]),
    ).toMatchObject({
      totalArtifacts: 2,
      uniqueRunCount: 1,
      executiveSummaryCount: 1,
      prdCount: 1,
    })
  })

  it('serializes run history csv export', () => {
    const exported = buildRunHistoryExportResponse({
      workspaceId: 'workspace_1',
      artifacts: [
        {
          artifactId: 'artifact_1',
          runId: 'run_1',
          artifactType: 'prd',
          artifactVersion: 'v1',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    })

    expect(serializeRunHistoryCsv(exported)).toContain('artifact_1')
    expect(serializeRunHistoryCsv(exported)).toContain('run_1')
  })
})
