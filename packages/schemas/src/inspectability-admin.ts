import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const inspectabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'billing_meter_usage_reports',
])
export type InspectabilityAdminDomain = z.infer<typeof inspectabilityAdminDomainSchema>

export const inspectabilityAdminRecordSchema = z.object({
  domain: inspectabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InspectabilityAdminRecord = z.infer<typeof inspectabilityAdminRecordSchema>

export const inspectabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  inspectabilityPercent: z.number().min(0).max(100),
})
export type InspectabilityAdminStats = z.infer<typeof inspectabilityAdminStatsSchema>

export const inspectabilityAdminActionSchema = z.enum(['refresh_inspectability_summary'])
export type InspectabilityAdminAction = z.infer<typeof inspectabilityAdminActionSchema>

export const inspectabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(inspectabilityAdminRecordSchema),
  stats: inspectabilityAdminStatsSchema,
  availableActions: z.array(inspectabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InspectabilityAdminSummaryResponse = z.infer<
  typeof inspectabilityAdminSummaryResponseSchema
>

export const inspectabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: inspectabilityAdminActionSchema,
})
export type InspectabilityAdminActionRequest = z.infer<
  typeof inspectabilityAdminActionRequestSchema
>

export const inspectabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: inspectabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: inspectabilityAdminStatsSchema.optional(),
})
export type InspectabilityAdminActionResponse = z.infer<
  typeof inspectabilityAdminActionResponseSchema
>
