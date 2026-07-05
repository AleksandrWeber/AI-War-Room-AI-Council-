import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const deducizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type DeducizabilityAdminDomain = z.infer<typeof deducizabilityAdminDomainSchema>

export const deducizabilityAdminRecordSchema = z.object({
  domain: deducizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DeducizabilityAdminRecord = z.infer<typeof deducizabilityAdminRecordSchema>

export const deducizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  deducizabilityPercent: z.number().min(0).max(100),
})
export type DeducizabilityAdminStats = z.infer<typeof deducizabilityAdminStatsSchema>

export const deducizabilityAdminActionSchema = z.enum(['refresh_deducizability_summary'])
export type DeducizabilityAdminAction = z.infer<typeof deducizabilityAdminActionSchema>

export const deducizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(deducizabilityAdminRecordSchema),
  stats: deducizabilityAdminStatsSchema,
  availableActions: z.array(deducizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DeducizabilityAdminSummaryResponse = z.infer<
  typeof deducizabilityAdminSummaryResponseSchema
>

export const deducizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deducizabilityAdminActionSchema,
})
export type DeducizabilityAdminActionRequest = z.infer<
  typeof deducizabilityAdminActionRequestSchema
>

export const deducizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deducizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: deducizabilityAdminStatsSchema.optional(),
})
export type DeducizabilityAdminActionResponse = z.infer<
  typeof deducizabilityAdminActionResponseSchema
>
