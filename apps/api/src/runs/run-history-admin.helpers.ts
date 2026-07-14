import type {
  ArtifactHistoryItem,
  RunHistoryAdminRecord,
  RunHistoryAdminStats,
  RunHistoryExportResponse,
} from '@ai-war-room/schemas'

export function toRunHistoryAdminRecord(
  artifact: ArtifactHistoryItem,
): RunHistoryAdminRecord {
  return {
    artifactId: artifact.artifactId,
    runId: artifact.runId,
    artifactType: artifact.artifactType,
    artifactVersion: artifact.artifactVersion,
    createdAt: artifact.createdAt,
  }
}

export function buildRunHistoryAdminStats(
  artifacts: RunHistoryAdminRecord[],
): RunHistoryAdminStats {
  const uniqueRunIds = new Set(artifacts.map((artifact) => artifact.runId))

  return {
    totalArtifacts: artifacts.length,
    uniqueRunCount: uniqueRunIds.size,
    ideaBriefCount: artifacts.filter(
      (artifact) => artifact.artifactType === 'idea_brief',
    ).length,
    masterPromptCount: artifacts.filter(
      (artifact) => artifact.artifactType === 'master_prompt',
    ).length,
    uiPromptCount: artifacts.filter(
      (artifact) => artifact.artifactType === 'ui_prompt',
    ).length,
    todoListCount: artifacts.filter(
      (artifact) => artifact.artifactType === 'todo_list',
    ).length,
  }
}

export function getRunHistoryAdminGuidance(input: {
  stats: RunHistoryAdminStats
}) {
  if (input.stats.totalArtifacts === 0) {
    return 'Workspace owners and admins can inspect run history metrics once persisted artifacts exist.'
  }

  return 'Workspace owners and admins can inspect persisted run history and export artifact records.'
}

export function resolveRunHistoryAdminActions() {
  return ['refresh_run_history_summary'] as const
}

export function buildRunHistoryExportResponse(input: {
  workspaceId: string
  artifacts: RunHistoryAdminRecord[]
}): RunHistoryExportResponse {
  const stats = buildRunHistoryAdminStats(input.artifacts)

  return {
    workspaceId: input.workspaceId,
    exportedAt: new Date().toISOString(),
    artifacts: input.artifacts,
    stats,
  }
}

export function serializeRunHistoryCsv(exportData: RunHistoryExportResponse) {
  const header = [
    'artifactId',
    'runId',
    'artifactType',
    'artifactVersion',
    'createdAt',
  ].join(',')

  const rows = exportData.artifacts.map((artifact) =>
    [
      artifact.artifactId,
      artifact.runId,
      artifact.artifactType,
      artifact.artifactVersion,
      artifact.createdAt,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(','),
  )

  return [header, ...rows].join('\n')
}

export function buildRunHistoryExportFilename(
  workspaceId: string,
  format: 'csv' | 'json',
) {
  return `${workspaceId}-run-history.${format}`
}
