import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const canaryizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type CanaryizabilityAdminDomain = z.infer<typeof canaryizabilityAdminDomainSchema>

export const canaryizabilityAdminRecordSchema = z.object({
  domain: canaryizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CanaryizabilityAdminRecord = z.infer<typeof canaryizabilityAdminRecordSchema>

export const canaryizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  canaryizabilityPercent: z.number().min(0).max(100),
})
export type CanaryizabilityAdminStats = z.infer<typeof canaryizabilityAdminStatsSchema>

export const canaryizabilityAdminActionSchema = z.enum(['refresh_canaryizability_summary'])
export type CanaryizabilityAdminAction = z.infer<typeof canaryizabilityAdminActionSchema>

export const canaryizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(canaryizabilityAdminRecordSchema),
  stats: canaryizabilityAdminStatsSchema,
  availableActions: z.array(canaryizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CanaryizabilityAdminSummaryResponse = z.infer<
  typeof canaryizabilityAdminSummaryResponseSchema
>

export const canaryizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: canaryizabilityAdminActionSchema,
})
export type CanaryizabilityAdminActionRequest = z.infer<
  typeof canaryizabilityAdminActionRequestSchema
>

export const canaryizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: canaryizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: canaryizabilityAdminStatsSchema.optional(),
})
export type CanaryizabilityAdminActionResponse = z.infer<
  typeof canaryizabilityAdminActionResponseSchema
>
