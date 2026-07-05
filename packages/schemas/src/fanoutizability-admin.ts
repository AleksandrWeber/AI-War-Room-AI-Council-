import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const fanoutizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type FanoutizabilityAdminDomain = z.infer<typeof fanoutizabilityAdminDomainSchema>

export const fanoutizabilityAdminRecordSchema = z.object({
  domain: fanoutizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FanoutizabilityAdminRecord = z.infer<typeof fanoutizabilityAdminRecordSchema>

export const fanoutizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  fanoutizabilityPercent: z.number().min(0).max(100),
})
export type FanoutizabilityAdminStats = z.infer<typeof fanoutizabilityAdminStatsSchema>

export const fanoutizabilityAdminActionSchema = z.enum(['refresh_fanoutizability_summary'])
export type FanoutizabilityAdminAction = z.infer<typeof fanoutizabilityAdminActionSchema>

export const fanoutizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(fanoutizabilityAdminRecordSchema),
  stats: fanoutizabilityAdminStatsSchema,
  availableActions: z.array(fanoutizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FanoutizabilityAdminSummaryResponse = z.infer<
  typeof fanoutizabilityAdminSummaryResponseSchema
>

export const fanoutizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: fanoutizabilityAdminActionSchema,
})
export type FanoutizabilityAdminActionRequest = z.infer<
  typeof fanoutizabilityAdminActionRequestSchema
>

export const fanoutizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: fanoutizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: fanoutizabilityAdminStatsSchema.optional(),
})
export type FanoutizabilityAdminActionResponse = z.infer<
  typeof fanoutizabilityAdminActionResponseSchema
>
