import type {
  UsageEvent,
  WorkspaceUsageLimit,
} from '@ai-war-room/schemas'
import type { DailyUsageTotal, UsageRepository } from './usage.repository.js'

const now = '2026-07-04T12:00:00.000Z'

export class InMemoryUsageRepository implements UsageRepository {
  private readonly limits = new Map<string, WorkspaceUsageLimit>([
    [
      'workspace_1',
      {
        workspaceId: 'workspace_1',
        paidTier: 'free',
        dailyTokenLimit: 250_000,
        dailyCostLimitUsd: 25,
        createdAt: now,
        updatedAt: now,
      },
    ],
    [
      'workspace_tiny_quota',
      {
        workspaceId: 'workspace_tiny_quota',
        paidTier: 'free',
        dailyTokenLimit: 100,
        dailyCostLimitUsd: 0.01,
        createdAt: now,
        updatedAt: now,
      },
    ],
  ])
  private readonly events: UsageEvent[] = []

  async getWorkspaceLimit(workspaceId: string): Promise<WorkspaceUsageLimit | null> {
    return this.limits.get(workspaceId) ?? null
  }

  async getDailyUsageTotal(workspaceId: string): Promise<DailyUsageTotal> {
    return this.events
      .filter((event) => event.workspaceId === workspaceId)
      .reduce<DailyUsageTotal>(
        (total, event) => ({
          inputTokens: total.inputTokens + event.inputTokens,
          outputTokens: total.outputTokens + event.outputTokens,
          estimatedCostUsd: total.estimatedCostUsd + event.estimatedCostUsd,
        }),
        {
          inputTokens: 0,
          outputTokens: 0,
          estimatedCostUsd: 0,
        },
      )
  }

  async recordUsageEvents(events: UsageEvent[]): Promise<void> {
    this.events.push(...events)
  }
}
