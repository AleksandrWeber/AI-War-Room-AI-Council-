import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { billingWorkspaceUsageResponseSchema } from './billing.js'
import { usagePhaseSchema } from './usage.js'
import { workspaceRoleSchema } from './workspace.js'

export const quotaAdminRecordSchema = z.object({
  usageEventId: nonEmptyStringSchema,
  runId: nonEmptyStringSchema,
  phase: usagePhaseSchema,
  totalTokens: z.number().int().nonnegative(),
  estimatedCostUsd: z.number().nonnegative(),
  createdAt: utcDateStringSchema,
})
export type QuotaAdminRecord = z.infer<typeof quotaAdminRecordSchema>

export const quotaAdminStatsSchema = z.object({
  dailyEventCount: z.number().int().nonnegative(),
  distinctRunCount: z.number().int().nonnegative(),
  tokenUtilizationPercent: z.number().nonnegative(),
  costUtilizationPercent: z.number().nonnegative(),
  quotaExceeded: z.boolean(),
})
export type QuotaAdminStats = z.infer<typeof quotaAdminStatsSchema>

export const quotaAdminActionSchema = z.enum(['refresh_quota_summary'])
export type QuotaAdminAction = z.infer<typeof quotaAdminActionSchema>

export const quotaAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  usage: billingWorkspaceUsageResponseSchema,
  records: z.array(quotaAdminRecordSchema),
  stats: quotaAdminStatsSchema,
  availableActions: z.array(quotaAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type QuotaAdminSummaryResponse = z.infer<
  typeof quotaAdminSummaryResponseSchema
>

export const quotaAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: quotaAdminActionSchema,
})
export type QuotaAdminActionRequest = z.infer<
  typeof quotaAdminActionRequestSchema
>

export const quotaAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: quotaAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: quotaAdminStatsSchema.optional(),
})
export type QuotaAdminActionResponse = z.infer<
  typeof quotaAdminActionResponseSchema
>
