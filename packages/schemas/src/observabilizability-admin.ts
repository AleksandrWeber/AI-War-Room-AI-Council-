import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const observabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type ObservabilizabilityAdminDomain = z.infer<typeof observabilizabilityAdminDomainSchema>

export const observabilizabilityAdminRecordSchema = z.object({
  domain: observabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ObservabilizabilityAdminRecord = z.infer<typeof observabilizabilityAdminRecordSchema>

export const observabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  observabilizabilityPercent: z.number().min(0).max(100),
})
export type ObservabilizabilityAdminStats = z.infer<typeof observabilizabilityAdminStatsSchema>

export const observabilizabilityAdminActionSchema = z.enum(['refresh_observabilizability_summary'])
export type ObservabilizabilityAdminAction = z.infer<typeof observabilizabilityAdminActionSchema>

export const observabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(observabilizabilityAdminRecordSchema),
  stats: observabilizabilityAdminStatsSchema,
  availableActions: z.array(observabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ObservabilizabilityAdminSummaryResponse = z.infer<
  typeof observabilizabilityAdminSummaryResponseSchema
>

export const observabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: observabilizabilityAdminActionSchema,
})
export type ObservabilizabilityAdminActionRequest = z.infer<
  typeof observabilizabilityAdminActionRequestSchema
>

export const observabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: observabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: observabilizabilityAdminStatsSchema.optional(),
})
export type ObservabilizabilityAdminActionResponse = z.infer<
  typeof observabilizabilityAdminActionResponseSchema
>
