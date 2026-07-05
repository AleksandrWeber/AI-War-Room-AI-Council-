import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const recoveryizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type RecoveryizabilityAdminDomain = z.infer<typeof recoveryizabilityAdminDomainSchema>

export const recoveryizabilityAdminRecordSchema = z.object({
  domain: recoveryizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RecoveryizabilityAdminRecord = z.infer<typeof recoveryizabilityAdminRecordSchema>

export const recoveryizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  recoveryizabilityPercent: z.number().min(0).max(100),
})
export type RecoveryizabilityAdminStats = z.infer<typeof recoveryizabilityAdminStatsSchema>

export const recoveryizabilityAdminActionSchema = z.enum(['refresh_recoveryizability_summary'])
export type RecoveryizabilityAdminAction = z.infer<typeof recoveryizabilityAdminActionSchema>

export const recoveryizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(recoveryizabilityAdminRecordSchema),
  stats: recoveryizabilityAdminStatsSchema,
  availableActions: z.array(recoveryizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RecoveryizabilityAdminSummaryResponse = z.infer<
  typeof recoveryizabilityAdminSummaryResponseSchema
>

export const recoveryizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: recoveryizabilityAdminActionSchema,
})
export type RecoveryizabilityAdminActionRequest = z.infer<
  typeof recoveryizabilityAdminActionRequestSchema
>

export const recoveryizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: recoveryizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: recoveryizabilityAdminStatsSchema.optional(),
})
export type RecoveryizabilityAdminActionResponse = z.infer<
  typeof recoveryizabilityAdminActionResponseSchema
>
