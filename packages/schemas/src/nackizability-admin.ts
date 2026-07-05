import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const nackizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type NackizabilityAdminDomain = z.infer<typeof nackizabilityAdminDomainSchema>

export const nackizabilityAdminRecordSchema = z.object({
  domain: nackizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NackizabilityAdminRecord = z.infer<typeof nackizabilityAdminRecordSchema>

export const nackizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  nackizabilityPercent: z.number().min(0).max(100),
})
export type NackizabilityAdminStats = z.infer<typeof nackizabilityAdminStatsSchema>

export const nackizabilityAdminActionSchema = z.enum(['refresh_nackizability_summary'])
export type NackizabilityAdminAction = z.infer<typeof nackizabilityAdminActionSchema>

export const nackizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(nackizabilityAdminRecordSchema),
  stats: nackizabilityAdminStatsSchema,
  availableActions: z.array(nackizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NackizabilityAdminSummaryResponse = z.infer<
  typeof nackizabilityAdminSummaryResponseSchema
>

export const nackizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: nackizabilityAdminActionSchema,
})
export type NackizabilityAdminActionRequest = z.infer<
  typeof nackizabilityAdminActionRequestSchema
>

export const nackizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: nackizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: nackizabilityAdminStatsSchema.optional(),
})
export type NackizabilityAdminActionResponse = z.infer<
  typeof nackizabilityAdminActionResponseSchema
>
