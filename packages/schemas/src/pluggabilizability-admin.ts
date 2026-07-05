import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const pluggabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type PluggabilizabilityAdminDomain = z.infer<typeof pluggabilizabilityAdminDomainSchema>

export const pluggabilizabilityAdminRecordSchema = z.object({
  domain: pluggabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PluggabilizabilityAdminRecord = z.infer<typeof pluggabilizabilityAdminRecordSchema>

export const pluggabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  pluggabilizabilityPercent: z.number().min(0).max(100),
})
export type PluggabilizabilityAdminStats = z.infer<typeof pluggabilizabilityAdminStatsSchema>

export const pluggabilizabilityAdminActionSchema = z.enum(['refresh_pluggabilizability_summary'])
export type PluggabilizabilityAdminAction = z.infer<typeof pluggabilizabilityAdminActionSchema>

export const pluggabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(pluggabilizabilityAdminRecordSchema),
  stats: pluggabilizabilityAdminStatsSchema,
  availableActions: z.array(pluggabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PluggabilizabilityAdminSummaryResponse = z.infer<
  typeof pluggabilizabilityAdminSummaryResponseSchema
>

export const pluggabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: pluggabilizabilityAdminActionSchema,
})
export type PluggabilizabilityAdminActionRequest = z.infer<
  typeof pluggabilizabilityAdminActionRequestSchema
>

export const pluggabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: pluggabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: pluggabilizabilityAdminStatsSchema.optional(),
})
export type PluggabilizabilityAdminActionResponse = z.infer<
  typeof pluggabilizabilityAdminActionResponseSchema
>
