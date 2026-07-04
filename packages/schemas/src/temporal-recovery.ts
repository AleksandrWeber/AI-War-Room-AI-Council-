import type { TemporalWorkflowStatus } from './workflow.js'

export function isTemporalActiveStatus(status: TemporalWorkflowStatus) {
  return status === 'running' || status === 'unknown'
}

export function isTemporalTerminalStatus(status: TemporalWorkflowStatus) {
  return !['running', 'unknown', 'disabled'].includes(status)
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

export function getTemporalRecoveryHint(
  status: TemporalWorkflowStatus,
  syncedFromTemporal: boolean,
) {
  if (status === 'completed') {
    return syncedFromTemporal
      ? 'Workflow completed. Artifact history should contain outputs for this run.'
      : 'Workflow appears completed in persisted metadata. Refresh artifact history if outputs are missing.'
  }

  if (isTemporalTerminalStatus(status)) {
    return formatTemporalFailureMessage(status)
  }

  if (!syncedFromTemporal) {
    return 'Showing last persisted workflow status. Resume observation to sync from Temporal and continue streaming.'
  }

  return 'Workflow is still running. Observation can continue from the last stream event.'
}

export function createTemporalObservationTimeoutMessage(timeoutMs: number) {
  const timeoutSeconds = Math.round(timeoutMs / 1000)

  return `Observation timed out after ${timeoutSeconds}s. The workflow may still be running — use Resume observation to sync status and continue.`
}
