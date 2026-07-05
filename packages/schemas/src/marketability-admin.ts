import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const marketabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'billing_meter_usage_reports',
])
export type MarketabilityAdminDomain = z.infer<typeof marketabilityAdminDomainSchema>

export const marketabilityAdminRecordSchema = z.object({
  domain: marketabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MarketabilityAdminRecord = z.infer<typeof marketabilityAdminRecordSchema>

export const marketabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  marketabilityPercent: z.number().min(0).max(100),
})
export type MarketabilityAdminStats = z.infer<typeof marketabilityAdminStatsSchema>

export const marketabilityAdminActionSchema = z.enum(['refresh_marketability_summary'])
export type MarketabilityAdminAction = z.infer<typeof marketabilityAdminActionSchema>

export const marketabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(marketabilityAdminRecordSchema),
  stats: marketabilityAdminStatsSchema,
  availableActions: z.array(marketabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MarketabilityAdminSummaryResponse = z.infer<
  typeof marketabilityAdminSummaryResponseSchema
>

export const marketabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: marketabilityAdminActionSchema,
})
export type MarketabilityAdminActionRequest = z.infer<
  typeof marketabilityAdminActionRequestSchema
>

export const marketabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: marketabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: marketabilityAdminStatsSchema.optional(),
})
export type MarketabilityAdminActionResponse = z.infer<
  typeof marketabilityAdminActionResponseSchema
>
