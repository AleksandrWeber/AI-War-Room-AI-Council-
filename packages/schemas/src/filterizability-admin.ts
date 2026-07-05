import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const filterizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type FilterizabilityAdminDomain = z.infer<typeof filterizabilityAdminDomainSchema>

export const filterizabilityAdminRecordSchema = z.object({
  domain: filterizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FilterizabilityAdminRecord = z.infer<typeof filterizabilityAdminRecordSchema>

export const filterizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  filterizabilityPercent: z.number().min(0).max(100),
})
export type FilterizabilityAdminStats = z.infer<typeof filterizabilityAdminStatsSchema>

export const filterizabilityAdminActionSchema = z.enum(['refresh_filterizability_summary'])
export type FilterizabilityAdminAction = z.infer<typeof filterizabilityAdminActionSchema>

export const filterizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(filterizabilityAdminRecordSchema),
  stats: filterizabilityAdminStatsSchema,
  availableActions: z.array(filterizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FilterizabilityAdminSummaryResponse = z.infer<
  typeof filterizabilityAdminSummaryResponseSchema
>

export const filterizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: filterizabilityAdminActionSchema,
})
export type FilterizabilityAdminActionRequest = z.infer<
  typeof filterizabilityAdminActionRequestSchema
>

export const filterizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: filterizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: filterizabilityAdminStatsSchema.optional(),
})
export type FilterizabilityAdminActionResponse = z.infer<
  typeof filterizabilityAdminActionResponseSchema
>
