import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const mapizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type MapizabilityAdminDomain = z.infer<typeof mapizabilityAdminDomainSchema>

export const mapizabilityAdminRecordSchema = z.object({
  domain: mapizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MapizabilityAdminRecord = z.infer<typeof mapizabilityAdminRecordSchema>

export const mapizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  mapizabilityPercent: z.number().min(0).max(100),
})
export type MapizabilityAdminStats = z.infer<typeof mapizabilityAdminStatsSchema>

export const mapizabilityAdminActionSchema = z.enum(['refresh_mapizability_summary'])
export type MapizabilityAdminAction = z.infer<typeof mapizabilityAdminActionSchema>

export const mapizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(mapizabilityAdminRecordSchema),
  stats: mapizabilityAdminStatsSchema,
  availableActions: z.array(mapizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MapizabilityAdminSummaryResponse = z.infer<
  typeof mapizabilityAdminSummaryResponseSchema
>

export const mapizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: mapizabilityAdminActionSchema,
})
export type MapizabilityAdminActionRequest = z.infer<
  typeof mapizabilityAdminActionRequestSchema
>

export const mapizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: mapizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: mapizabilityAdminStatsSchema.optional(),
})
export type MapizabilityAdminActionResponse = z.infer<
  typeof mapizabilityAdminActionResponseSchema
>
