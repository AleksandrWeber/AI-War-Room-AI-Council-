import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const usagePhaseSchema = z.enum([
  'agent',
  'chunk_summary',
  'moderator',
  'idea_brief',
  'master_prompt',
  'todo_list',
])
export type UsagePhase = z.infer<typeof usagePhaseSchema>

export const paidTierSchema = z.enum(['free', 'pro', 'business'])
export type PaidTier = z.infer<typeof paidTierSchema>

export const usageEventSchema = z.object({
  usageEventId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  userId: nonEmptyStringSchema,
  runId: nonEmptyStringSchema,
  phase: usagePhaseSchema,
  sourceId: nonEmptyStringSchema,
  modelProvider: nonEmptyStringSchema,
  modelName: nonEmptyStringSchema,
  promptVersion: nonEmptyStringSchema,
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  estimatedCostUsd: z.number().nonnegative(),
  createdAt: utcDateStringSchema,
})
export type UsageEvent = z.infer<typeof usageEventSchema>

export const workspaceUsageLimitSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  paidTier: paidTierSchema,
  dailyTokenLimit: z.number().int().positive(),
  dailyCostLimitUsd: z.number().positive(),
  createdAt: utcDateStringSchema,
  updatedAt: utcDateStringSchema,
})
export type WorkspaceUsageLimit = z.infer<typeof workspaceUsageLimitSchema>
