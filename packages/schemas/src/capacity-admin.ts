import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const capacityAdminDomainSchema = z.enum([
  'active_runs',
  'completed_runs',
  'usage_events',
  'workspace_limits',
])
export type CapacityAdminDomain = z.infer<typeof capacityAdminDomainSchema>

export const capacityAdminRecordSchema = z.object({
  domain: capacityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CapacityAdminRecord = z.infer<typeof capacityAdminRecordSchema>

export const capacityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  loadUtilizationPercent: z.number().min(0).max(100),
})
export type CapacityAdminStats = z.infer<typeof capacityAdminStatsSchema>

export const capacityAdminActionSchema = z.enum(['refresh_capacity_summary'])
export type CapacityAdminAction = z.infer<typeof capacityAdminActionSchema>

export const capacityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(capacityAdminRecordSchema),
  stats: capacityAdminStatsSchema,
  availableActions: z.array(capacityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CapacityAdminSummaryResponse = z.infer<
  typeof capacityAdminSummaryResponseSchema
>

export const capacityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: capacityAdminActionSchema,
})
export type CapacityAdminActionRequest = z.infer<
  typeof capacityAdminActionRequestSchema
>

export const capacityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: capacityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: capacityAdminStatsSchema.optional(),
})
export type CapacityAdminActionResponse = z.infer<
  typeof capacityAdminActionResponseSchema
>
