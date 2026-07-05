import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const extrapolizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type ExtrapolizabilityAdminDomain = z.infer<typeof extrapolizabilityAdminDomainSchema>

export const extrapolizabilityAdminRecordSchema = z.object({
  domain: extrapolizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ExtrapolizabilityAdminRecord = z.infer<typeof extrapolizabilityAdminRecordSchema>

export const extrapolizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  extrapolizabilityPercent: z.number().min(0).max(100),
})
export type ExtrapolizabilityAdminStats = z.infer<typeof extrapolizabilityAdminStatsSchema>

export const extrapolizabilityAdminActionSchema = z.enum(['refresh_extrapolizability_summary'])
export type ExtrapolizabilityAdminAction = z.infer<typeof extrapolizabilityAdminActionSchema>

export const extrapolizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(extrapolizabilityAdminRecordSchema),
  stats: extrapolizabilityAdminStatsSchema,
  availableActions: z.array(extrapolizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ExtrapolizabilityAdminSummaryResponse = z.infer<
  typeof extrapolizabilityAdminSummaryResponseSchema
>

export const extrapolizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: extrapolizabilityAdminActionSchema,
})
export type ExtrapolizabilityAdminActionRequest = z.infer<
  typeof extrapolizabilityAdminActionRequestSchema
>

export const extrapolizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: extrapolizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: extrapolizabilityAdminStatsSchema.optional(),
})
export type ExtrapolizabilityAdminActionResponse = z.infer<
  typeof extrapolizabilityAdminActionResponseSchema
>
