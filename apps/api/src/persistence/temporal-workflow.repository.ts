import type {
  TemporalWorkflowRecord,
  TemporalWorkflowStatus,
} from '@ai-war-room/schemas'

export const TEMPORAL_WORKFLOW_REPOSITORY = Symbol('TEMPORAL_WORKFLOW_REPOSITORY')

export type SaveTemporalWorkflowInput = {
  runId: string
  workspaceId: string
  workflowId: string
  temporalRunId?: string
  taskQueue: string
  status: TemporalWorkflowStatus
  startedAt: string
}

export type UpdateTemporalWorkflowStatusInput = {
  workspaceId: string
  workflowId: string
  temporalRunId?: string
  status: TemporalWorkflowStatus
  checkedAt: string
}

export interface TemporalWorkflowRepository {
  saveStartedWorkflow(input: SaveTemporalWorkflowInput): Promise<TemporalWorkflowRecord>
  updateWorkflowStatus(
    input: UpdateTemporalWorkflowStatusInput,
  ): Promise<TemporalWorkflowRecord | null>
  findWorkflowById(input: {
    workspaceId: string
    workflowId: string
  }): Promise<TemporalWorkflowRecord | null>
  findWorkflowByRunId(input: {
    workspaceId: string
    runId: string
  }): Promise<TemporalWorkflowRecord | null>
}
