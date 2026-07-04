import {
  type TemporalWorkflowRecord,
  temporalWorkflowRecordSchema,
} from '@ai-war-room/schemas'
import type {
  SaveTemporalWorkflowInput,
  TemporalWorkflowRepository,
  UpdateTemporalWorkflowStatusInput,
} from './temporal-workflow.repository.js'

export class InMemoryTemporalWorkflowRepository
  implements TemporalWorkflowRepository
{
  private readonly workflowsById = new Map<string, TemporalWorkflowRecord>()

  async saveStartedWorkflow(
    input: SaveTemporalWorkflowInput,
  ): Promise<TemporalWorkflowRecord> {
    const existing = this.workflowsById.get(input.workflowId)
    const record = temporalWorkflowRecordSchema.parse({
      runId: input.runId,
      workspaceId: input.workspaceId,
      workflowId: input.workflowId,
      temporalRunId: input.temporalRunId ?? existing?.temporalRunId,
      taskQueue: input.taskQueue,
      status: input.status,
      startedAt: existing?.startedAt ?? input.startedAt,
      lastCheckedAt: existing?.lastCheckedAt,
      completedAt: existing?.completedAt,
      updatedAt: input.startedAt,
    })

    this.workflowsById.set(input.workflowId, record)

    return record
  }

  async updateWorkflowStatus(
    input: UpdateTemporalWorkflowStatusInput,
  ): Promise<TemporalWorkflowRecord | null> {
    const existing = this.workflowsById.get(input.workflowId)

    if (!existing || existing.workspaceId !== input.workspaceId) {
      return null
    }

    const record = temporalWorkflowRecordSchema.parse({
      ...existing,
      temporalRunId: input.temporalRunId ?? existing.temporalRunId,
      status: input.status,
      lastCheckedAt: input.checkedAt,
      completedAt: this.isTerminalStatus(input.status)
        ? existing.completedAt ?? input.checkedAt
        : existing.completedAt,
      updatedAt: input.checkedAt,
    })

    this.workflowsById.set(input.workflowId, record)

    return record
  }

  async findWorkflowById(input: {
    workspaceId: string
    workflowId: string
  }): Promise<TemporalWorkflowRecord | null> {
    const workflow = this.workflowsById.get(input.workflowId)

    return workflow?.workspaceId === input.workspaceId ? workflow : null
  }

  async findWorkflowByRunId(input: {
    workspaceId: string
    runId: string
  }): Promise<TemporalWorkflowRecord | null> {
    let latestWorkflow: TemporalWorkflowRecord | null = null

    for (const workflow of this.workflowsById.values()) {
      if (
        workflow.workspaceId !== input.workspaceId ||
        workflow.runId !== input.runId
      ) {
        continue
      }

      if (
        !latestWorkflow ||
        workflow.startedAt.localeCompare(latestWorkflow.startedAt) > 0
      ) {
        latestWorkflow = workflow
      }
    }

    return latestWorkflow
  }

  private isTerminalStatus(status: TemporalWorkflowRecord['status']) {
    return !['running', 'unknown', 'disabled'].includes(status)
  }
}
