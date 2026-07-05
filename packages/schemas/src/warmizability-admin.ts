import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const warmizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type WarmizabilityAdminDomain = z.infer<typeof warmizabilityAdminDomainSchema>

export const warmizabilityAdminRecordSchema = z.object({
  domain: warmizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type WarmizabilityAdminRecord = z.infer<typeof warmizabilityAdminRecordSchema>

export const warmizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  warmizabilityPercent: z.number().min(0).max(100),
})
export type WarmizabilityAdminStats = z.infer<typeof warmizabilityAdminStatsSchema>

export const warmizabilityAdminActionSchema = z.enum(['refresh_warmizability_summary'])
export type WarmizabilityAdminAction = z.infer<typeof warmizabilityAdminActionSchema>

export const warmizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(warmizabilityAdminRecordSchema),
  stats: warmizabilityAdminStatsSchema,
  availableActions: z.array(warmizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type WarmizabilityAdminSummaryResponse = z.infer<
  typeof warmizabilityAdminSummaryResponseSchema
>

export const warmizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: warmizabilityAdminActionSchema,
})
export type WarmizabilityAdminActionRequest = z.infer<
  typeof warmizabilityAdminActionRequestSchema
>

export const warmizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: warmizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: warmizabilityAdminStatsSchema.optional(),
})
export type WarmizabilityAdminActionResponse = z.infer<
  typeof warmizabilityAdminActionResponseSchema
>
