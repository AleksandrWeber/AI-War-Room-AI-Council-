import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { billingWorkspaceUsageResponseSchema } from './billing.js'
import { workspaceRoleSchema } from './workspace.js'

export const usageCapabilitiesResponseSchema = z.object({
  supportsUsageSummary: z.literal(true),
  supportsUsageAdminTools: z.literal(true),
  guidance: z.string().trim().min(1),
})
export type UsageCapabilitiesResponse = z.infer<
  typeof usageCapabilitiesResponseSchema
>

export const usageAdminActionSchema = z.enum(['reset_daily_usage'])
export type UsageAdminAction = z.infer<typeof usageAdminActionSchema>

export const usageAdminStatsSchema = z.object({
  dailyEventCount: z.number().int().nonnegative(),
  distinctRunCount: z.number().int().nonnegative(),
  tokenUtilizationPercent: z.number().nonnegative(),
  costUtilizationPercent: z.number().nonnegative(),
})
export type UsageAdminStats = z.infer<typeof usageAdminStatsSchema>

export const usageAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  usage: billingWorkspaceUsageResponseSchema,
  stats: usageAdminStatsSchema,
  availableActions: z.array(usageAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type UsageAdminSummaryResponse = z.infer<
  typeof usageAdminSummaryResponseSchema
>

export const usageAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: usageAdminActionSchema,
})
export type UsageAdminActionRequest = z.infer<
  typeof usageAdminActionRequestSchema
>

export const usageAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: usageAdminActionSchema,
  message: nonEmptyStringSchema,
  usage: billingWorkspaceUsageResponseSchema.optional(),
})
export type UsageAdminActionResponse = z.infer<
  typeof usageAdminActionResponseSchema
>
