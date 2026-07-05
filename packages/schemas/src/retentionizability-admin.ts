import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const retentionizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type RetentionizabilityAdminDomain = z.infer<typeof retentionizabilityAdminDomainSchema>

export const retentionizabilityAdminRecordSchema = z.object({
  domain: retentionizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RetentionizabilityAdminRecord = z.infer<typeof retentionizabilityAdminRecordSchema>

export const retentionizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  retentionizabilityPercent: z.number().min(0).max(100),
})
export type RetentionizabilityAdminStats = z.infer<typeof retentionizabilityAdminStatsSchema>

export const retentionizabilityAdminActionSchema = z.enum(['refresh_retentionizability_summary'])
export type RetentionizabilityAdminAction = z.infer<typeof retentionizabilityAdminActionSchema>

export const retentionizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(retentionizabilityAdminRecordSchema),
  stats: retentionizabilityAdminStatsSchema,
  availableActions: z.array(retentionizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RetentionizabilityAdminSummaryResponse = z.infer<
  typeof retentionizabilityAdminSummaryResponseSchema
>

export const retentionizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: retentionizabilityAdminActionSchema,
})
export type RetentionizabilityAdminActionRequest = z.infer<
  typeof retentionizabilityAdminActionRequestSchema
>

export const retentionizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: retentionizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: retentionizabilityAdminStatsSchema.optional(),
})
export type RetentionizabilityAdminActionResponse = z.infer<
  typeof retentionizabilityAdminActionResponseSchema
>
