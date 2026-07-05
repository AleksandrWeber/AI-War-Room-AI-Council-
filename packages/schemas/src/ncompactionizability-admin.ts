import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const ncompactionizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type NcompactionizabilityAdminDomain = z.infer<typeof ncompactionizabilityAdminDomainSchema>

export const ncompactionizabilityAdminRecordSchema = z.object({
  domain: ncompactionizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NcompactionizabilityAdminRecord = z.infer<typeof ncompactionizabilityAdminRecordSchema>

export const ncompactionizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  ncompactionizabilityPercent: z.number().min(0).max(100),
})
export type NcompactionizabilityAdminStats = z.infer<typeof ncompactionizabilityAdminStatsSchema>

export const ncompactionizabilityAdminActionSchema = z.enum(['refresh_ncompactionizability_summary'])
export type NcompactionizabilityAdminAction = z.infer<typeof ncompactionizabilityAdminActionSchema>

export const ncompactionizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(ncompactionizabilityAdminRecordSchema),
  stats: ncompactionizabilityAdminStatsSchema,
  availableActions: z.array(ncompactionizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NcompactionizabilityAdminSummaryResponse = z.infer<
  typeof ncompactionizabilityAdminSummaryResponseSchema
>

export const ncompactionizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ncompactionizabilityAdminActionSchema,
})
export type NcompactionizabilityAdminActionRequest = z.infer<
  typeof ncompactionizabilityAdminActionRequestSchema
>

export const ncompactionizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ncompactionizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: ncompactionizabilityAdminStatsSchema.optional(),
})
export type NcompactionizabilityAdminActionResponse = z.infer<
  typeof ncompactionizabilityAdminActionResponseSchema
>
