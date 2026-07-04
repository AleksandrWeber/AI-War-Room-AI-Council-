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

export interface UsageRepository {
  getWorkspaceLimit(workspaceId: string): Promise<WorkspaceUsageLimit | null>
  getDailyUsageTotal(workspaceId: string): Promise<DailyUsageTotal>
  recordUsageEvents(events: UsageEvent[]): Promise<void>
}
