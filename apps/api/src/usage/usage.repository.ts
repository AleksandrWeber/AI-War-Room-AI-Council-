import type {
  UsageEvent,
  WorkspaceUsageLimit,
} from '@ai-war-room/schemas'

export const USAGE_REPOSITORY = Symbol('USAGE_REPOSITORY')

export type DailyUsageTotal = {
  inputTokens: number
  outputTokens: number
  estimatedCostUsd: number
}

export type DailyUsageMetrics = {
  dailyEventCount: number
  distinctRunCount: number
}

export interface UsageRepository {
  getWorkspaceLimit(workspaceId: string): Promise<WorkspaceUsageLimit | null>
  getDailyUsageTotal(workspaceId: string): Promise<DailyUsageTotal>
  getDailyUsageMetrics(workspaceId: string): Promise<DailyUsageMetrics>
  resetDailyUsage(workspaceId: string): Promise<void>
  listWorkspaceUsageEvents(
    workspaceId: string,
    limit?: number,
  ): Promise<UsageEvent[]>
  recordUsageEvents(events: UsageEvent[]): Promise<void>
}
