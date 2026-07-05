import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const discoverabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'billing_notifications',
])
export type DiscoverabilityAdminDomain = z.infer<typeof discoverabilityAdminDomainSchema>

export const discoverabilityAdminRecordSchema = z.object({
  domain: discoverabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DiscoverabilityAdminRecord = z.infer<typeof discoverabilityAdminRecordSchema>

export const discoverabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  discoverabilityPercent: z.number().min(0).max(100),
})
export type DiscoverabilityAdminStats = z.infer<typeof discoverabilityAdminStatsSchema>

export const discoverabilityAdminActionSchema = z.enum(['refresh_discoverability_summary'])
export type DiscoverabilityAdminAction = z.infer<typeof discoverabilityAdminActionSchema>

export const discoverabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(discoverabilityAdminRecordSchema),
  stats: discoverabilityAdminStatsSchema,
  availableActions: z.array(discoverabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DiscoverabilityAdminSummaryResponse = z.infer<
  typeof discoverabilityAdminSummaryResponseSchema
>

export const discoverabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: discoverabilityAdminActionSchema,
})
export type DiscoverabilityAdminActionRequest = z.infer<
  typeof discoverabilityAdminActionRequestSchema
>

export const discoverabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: discoverabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: discoverabilityAdminStatsSchema.optional(),
})
export type DiscoverabilityAdminActionResponse = z.infer<
  typeof discoverabilityAdminActionResponseSchema
>
