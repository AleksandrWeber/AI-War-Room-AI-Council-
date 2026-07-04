import { Injectable } from '@nestjs/common'
import type {
  UsageEvent,
  WorkspaceUsageLimit,
} from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import type {
  DailyUsageMetrics,
  DailyUsageTotal,
  UsageRepository,
} from './usage.repository.js'

type UsageLimitRow = {
  workspace_id: string
  paid_tier: WorkspaceUsageLimit['paidTier']
  daily_token_limit: number
  daily_cost_limit_usd: string
  created_at: Date
  updated_at: Date
}

type DailyUsageRow = {
  input_tokens: string
  output_tokens: string
  estimated_cost_usd: string
}

type DailyUsageMetricsRow = {
  daily_event_count: string
  distinct_run_count: string
}

type UsageEventRow = {
  usage_event_id: string
  workspace_id: string
  user_id: string
  run_id: string
  phase: UsageEvent['phase']
  source_id: string
  model_provider: string
  model_name: string
  prompt_version: string
  input_tokens: number
  output_tokens: number
  estimated_cost_usd: string
  created_at: Date
}

@Injectable()
export class PostgresUsageRepository implements UsageRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async getWorkspaceLimit(workspaceId: string): Promise<WorkspaceUsageLimit | null> {
    const result = await this.postgresService.query<UsageLimitRow>(
      `
        SELECT
          workspace_id,
          paid_tier,
          daily_token_limit,
          daily_cost_limit_usd,
          created_at,
          updated_at
        FROM workspace_usage_limits
        WHERE workspace_id = $1
        LIMIT 1
      `,
      [workspaceId],
    )
    const row = result.rows[0]

    if (!row) {
      return null
    }

    return {
      workspaceId: row.workspace_id,
      paidTier: row.paid_tier,
      dailyTokenLimit: row.daily_token_limit,
      dailyCostLimitUsd: Number(row.daily_cost_limit_usd),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    }
  }

  async getDailyUsageTotal(workspaceId: string): Promise<DailyUsageTotal> {
    const result = await this.postgresService.query<DailyUsageRow>(
      `
        SELECT
          COALESCE(SUM(input_tokens), 0)::TEXT AS input_tokens,
          COALESCE(SUM(output_tokens), 0)::TEXT AS output_tokens,
          COALESCE(SUM(estimated_cost_usd), 0)::TEXT AS estimated_cost_usd
        FROM usage_events
        WHERE workspace_id = $1
          AND created_at >= date_trunc('day', NOW())
      `,
      [workspaceId],
    )
    const row = result.rows[0]

    return {
      inputTokens: Number(row?.input_tokens ?? 0),
      outputTokens: Number(row?.output_tokens ?? 0),
      estimatedCostUsd: Number(row?.estimated_cost_usd ?? 0),
    }
  }

  async getDailyUsageMetrics(workspaceId: string): Promise<DailyUsageMetrics> {
    const result = await this.postgresService.query<DailyUsageMetricsRow>(
      `
        SELECT
          COUNT(*)::TEXT AS daily_event_count,
          COUNT(DISTINCT run_id)::TEXT AS distinct_run_count
        FROM usage_events
        WHERE workspace_id = $1
          AND created_at >= date_trunc('day', NOW())
      `,
      [workspaceId],
    )
    const row = result.rows[0]

    return {
      dailyEventCount: Number(row?.daily_event_count ?? 0),
      distinctRunCount: Number(row?.distinct_run_count ?? 0),
    }
  }

  async resetDailyUsage(workspaceId: string): Promise<void> {
    await this.postgresService.query(
      `
        DELETE FROM usage_events
        WHERE workspace_id = $1
          AND created_at >= date_trunc('day', NOW())
      `,
      [workspaceId],
    )
  }

  async recordUsageEvents(events: UsageEvent[]): Promise<void> {
    if (events.length === 0) {
      return
    }

    await this.postgresService.transaction(async (client) => {
      for (const event of events) {
        await client.query(
          `
            INSERT INTO usage_events (
              usage_event_id,
              workspace_id,
              user_id,
              run_id,
              phase,
              source_id,
              model_provider,
              model_name,
              prompt_version,
              input_tokens,
              output_tokens,
              estimated_cost_usd,
              created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (usage_event_id) DO NOTHING
          `,
          [
            event.usageEventId,
            event.workspaceId,
            event.userId,
            event.runId,
            event.phase,
            event.sourceId,
            event.modelProvider,
            event.modelName,
            event.promptVersion,
            event.inputTokens,
            event.outputTokens,
            event.estimatedCostUsd,
            event.createdAt,
          ],
        )
      }
    })
  }

  async listWorkspaceUsageEvents(
    workspaceId: string,
    limit = 500,
  ): Promise<UsageEvent[]> {
    const result = await this.postgresService.query<UsageEventRow>(
      `
        SELECT
          usage_event_id,
          workspace_id,
          user_id,
          run_id,
          phase,
          source_id,
          model_provider,
          model_name,
          prompt_version,
          input_tokens,
          output_tokens,
          estimated_cost_usd,
          created_at
        FROM usage_events
        WHERE workspace_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [workspaceId, limit],
    )

    return result.rows.map((row) => ({
      usageEventId: row.usage_event_id,
      workspaceId: row.workspace_id,
      userId: row.user_id,
      runId: row.run_id,
      phase: row.phase,
      sourceId: row.source_id,
      modelProvider: row.model_provider,
      modelName: row.model_name,
      promptVersion: row.prompt_version,
      inputTokens: row.input_tokens,
      outputTokens: row.output_tokens,
      estimatedCostUsd: Number(row.estimated_cost_usd),
      createdAt: row.created_at.toISOString(),
    }))
  }
}
