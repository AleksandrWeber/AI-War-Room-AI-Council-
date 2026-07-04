import {
  type TemporalWorkflowRecord,
  type TemporalWorkflowStatus,
  temporalWorkflowRecordSchema,
} from '@ai-war-room/schemas'
import { Injectable } from '@nestjs/common'
import { PostgresService } from './postgres.service.js'
import type {
  SaveTemporalWorkflowInput,
  TemporalWorkflowRepository,
  UpdateTemporalWorkflowStatusInput,
} from './temporal-workflow.repository.js'

type TemporalWorkflowRow = {
  run_id: string
  workspace_id: string
  workflow_id: string
  temporal_run_id: string | null
  task_queue: string
  status: TemporalWorkflowStatus
  started_at: Date
  last_checked_at: Date | null
  completed_at: Date | null
  updated_at: Date
}

@Injectable()
export class PostgresTemporalWorkflowRepository
  implements TemporalWorkflowRepository
{
  constructor(private readonly postgresService: PostgresService) {}

  async saveStartedWorkflow(
    input: SaveTemporalWorkflowInput,
  ): Promise<TemporalWorkflowRecord> {
    const result = await this.postgresService.query<TemporalWorkflowRow>(
      `
        INSERT INTO run_workflows (
          workflow_id,
          run_id,
          workspace_id,
          temporal_run_id,
          task_queue,
          status,
          started_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
        ON CONFLICT (workflow_id)
        DO UPDATE SET temporal_run_id = COALESCE(
                        EXCLUDED.temporal_run_id,
                        run_workflows.temporal_run_id
                      ),
                      task_queue = EXCLUDED.task_queue,
                      status = EXCLUDED.status,
                      updated_at = EXCLUDED.updated_at
        RETURNING *
      `,
      [
        input.workflowId,
        input.runId,
        input.workspaceId,
        input.temporalRunId ?? null,
        input.taskQueue,
        input.status,
        input.startedAt,
      ],
    )

    return this.parseRow(result.rows[0])
  }

  async updateWorkflowStatus(
    input: UpdateTemporalWorkflowStatusInput,
  ): Promise<TemporalWorkflowRecord | null> {
    const result = await this.postgresService.query<TemporalWorkflowRow>(
      `
        UPDATE run_workflows
        SET temporal_run_id = COALESCE($3, temporal_run_id),
            status = $4,
            last_checked_at = $5,
            completed_at = CASE
              WHEN $4 = ANY($6::TEXT[]) THEN COALESCE(completed_at, $5)
              ELSE completed_at
            END,
            updated_at = $5
        WHERE workspace_id = $1
          AND workflow_id = $2
        RETURNING *
      `,
      [
        input.workspaceId,
        input.workflowId,
        input.temporalRunId ?? null,
        input.status,
        input.checkedAt,
        this.terminalStatuses(),
      ],
    )

    const row = result.rows[0]

    return row ? this.parseRow(row) : null
  }

  async findWorkflowById(input: {
    workspaceId: string
    workflowId: string
  }): Promise<TemporalWorkflowRecord | null> {
    const result = await this.postgresService.query<TemporalWorkflowRow>(
      `
        SELECT *
        FROM run_workflows
        WHERE workspace_id = $1
          AND workflow_id = $2
        LIMIT 1
      `,
      [input.workspaceId, input.workflowId],
    )
    const row = result.rows[0]

    return row ? this.parseRow(row) : null
  }

  private parseRow(row: TemporalWorkflowRow | undefined) {
    if (!row) {
      throw new Error('Temporal workflow row was not returned.')
    }

    return temporalWorkflowRecordSchema.parse({
      runId: row.run_id,
      workspaceId: row.workspace_id,
      workflowId: row.workflow_id,
      temporalRunId: row.temporal_run_id ?? undefined,
      taskQueue: row.task_queue,
      status: row.status,
      startedAt: row.started_at.toISOString(),
      lastCheckedAt: row.last_checked_at?.toISOString(),
      completedAt: row.completed_at?.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    })
  }

  private terminalStatuses(): TemporalWorkflowStatus[] {
    return ['completed', 'failed', 'canceled', 'terminated', 'timed_out', 'continued_as_new']
  }
}
