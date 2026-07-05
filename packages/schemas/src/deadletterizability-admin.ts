import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const deadletterizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type DeadletterizabilityAdminDomain = z.infer<typeof deadletterizabilityAdminDomainSchema>

export const deadletterizabilityAdminRecordSchema = z.object({
  domain: deadletterizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DeadletterizabilityAdminRecord = z.infer<typeof deadletterizabilityAdminRecordSchema>

export const deadletterizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  deadletterizabilityPercent: z.number().min(0).max(100),
})
export type DeadletterizabilityAdminStats = z.infer<typeof deadletterizabilityAdminStatsSchema>

export const deadletterizabilityAdminActionSchema = z.enum(['refresh_deadletterizability_summary'])
export type DeadletterizabilityAdminAction = z.infer<typeof deadletterizabilityAdminActionSchema>

export const deadletterizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(deadletterizabilityAdminRecordSchema),
  stats: deadletterizabilityAdminStatsSchema,
  availableActions: z.array(deadletterizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DeadletterizabilityAdminSummaryResponse = z.infer<
  typeof deadletterizabilityAdminSummaryResponseSchema
>

export const deadletterizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deadletterizabilityAdminActionSchema,
})
export type DeadletterizabilityAdminActionRequest = z.infer<
  typeof deadletterizabilityAdminActionRequestSchema
>

export const deadletterizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deadletterizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: deadletterizabilityAdminStatsSchema.optional(),
})
export type DeadletterizabilityAdminActionResponse = z.infer<
  typeof deadletterizabilityAdminActionResponseSchema
>
