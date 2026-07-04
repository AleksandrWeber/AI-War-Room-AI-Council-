export type TemporalWorkflowStatus =
  | 'disabled'
  | 'running'
  | 'completed'
  | 'failed'
  | 'canceled'
  | 'terminated'
  | 'timed_out'
  | 'continued_as_new'
  | 'unknown'

export type PersistedTemporalWorkflow = {
  runId: string
  workspaceId: string
  workflowId: string
  temporalRunId?: string
  taskQueue: string
  status: TemporalWorkflowStatus
  startedAt: string
  lastStreamEventId?: string | null
  persistedAt: string
}

export type TemporalRunStartResponse = {
  runId: string
  workspaceId: string
  workflowId: string
  temporalRunId?: string
  taskQueue: string
  status: TemporalWorkflowStatus
  temporalEnabled: true
  startedAt: string
}

export type TemporalWorkflowRecoveryResponse = {
  workflow: {
    runId: string
    workspaceId: string
    workflowId: string
    temporalRunId?: string
    taskQueue: string
    status: TemporalWorkflowStatus
    startedAt: string
    lastCheckedAt?: string
    completedAt?: string
    updatedAt: string
  }
  syncedFromTemporal: boolean
  recoveryHint: string
}

export const temporalWorkflowStorageKey = 'ai-war-room.temporal-workflow'

export const useTemporalWorkflowRuntime =
  import.meta.env.VITE_USE_TEMPORAL_WORKFLOWS === 'true'

export const temporalObservationTimeoutMs = Number(
  import.meta.env.VITE_TEMPORAL_OBSERVATION_TIMEOUT_MS ?? 300_000,
)

export const temporalInitialPollDelayMs = 500
export const temporalPollIntervalMs = 1_500

export function isTemporalTerminalStatus(status: TemporalWorkflowStatus) {
  return !['running', 'unknown', 'disabled'].includes(status)
}

export function isTemporalActiveStatus(status: TemporalWorkflowStatus) {
  return status === 'running' || status === 'unknown'
}

export function formatTemporalFailureMessage(status: TemporalWorkflowStatus) {
  switch (status) {
    case 'failed':
      return 'Temporal workflow failed during execution. Review worker logs and retry the run if needed.'
    case 'canceled':
      return 'Temporal workflow was canceled before completion.'
    case 'terminated':
      return 'Temporal workflow was terminated by an operator or policy.'
    case 'timed_out':
      return 'Temporal workflow exceeded its execution timeout.'
    case 'continued_as_new':
      return 'Temporal workflow continued as a new execution. Resume observation to follow the updated run.'
    default:
      return `Temporal workflow ended with status: ${status}`
  }
}

export function createTemporalObservationTimeoutMessage(timeoutMs: number) {
  const timeoutSeconds = Math.round(timeoutMs / 1000)

  return `Observation timed out after ${timeoutSeconds}s. The workflow may still be running — use Resume observation to sync status and continue.`
}

export function toTemporalRunStartResponse(
  workflow: PersistedTemporalWorkflow | TemporalWorkflowRecoveryResponse['workflow'],
): TemporalRunStartResponse {
  return {
    runId: workflow.runId,
    workspaceId: workflow.workspaceId,
    workflowId: workflow.workflowId,
    temporalRunId: workflow.temporalRunId,
    taskQueue: workflow.taskQueue,
    status: workflow.status,
    temporalEnabled: true,
    startedAt: workflow.startedAt,
  }
}

export function loadPersistedTemporalWorkflow() {
  const saved = localStorage.getItem(temporalWorkflowStorageKey)

  if (!saved) {
    return null
  }

  try {
    return JSON.parse(saved) as PersistedTemporalWorkflow
  } catch {
    return null
  }
}

export function savePersistedTemporalWorkflow(
  workflow: PersistedTemporalWorkflow | null,
) {
  if (!workflow) {
    localStorage.removeItem(temporalWorkflowStorageKey)
    return
  }

  localStorage.setItem(temporalWorkflowStorageKey, JSON.stringify(workflow))
}

export function canResumeTemporalWorkflow(input: {
  runId: string | null | undefined
  workflow: PersistedTemporalWorkflow | TemporalRunStartResponse | null
}) {
  if (!input.runId || !input.workflow) {
    return false
  }

  return (
    input.workflow.runId === input.runId &&
    isTemporalActiveStatus(input.workflow.status)
  )
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
