import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const auditjournalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type AuditjournalizabilityAdminDomain = z.infer<typeof auditjournalizabilityAdminDomainSchema>

export const auditjournalizabilityAdminRecordSchema = z.object({
  domain: auditjournalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuditjournalizabilityAdminRecord = z.infer<typeof auditjournalizabilityAdminRecordSchema>

export const auditjournalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  auditjournalizabilityPercent: z.number().min(0).max(100),
})
export type AuditjournalizabilityAdminStats = z.infer<typeof auditjournalizabilityAdminStatsSchema>

export const auditjournalizabilityAdminActionSchema = z.enum(['refresh_auditjournalizability_summary'])
export type AuditjournalizabilityAdminAction = z.infer<typeof auditjournalizabilityAdminActionSchema>

export const auditjournalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(auditjournalizabilityAdminRecordSchema),
  stats: auditjournalizabilityAdminStatsSchema,
  availableActions: z.array(auditjournalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuditjournalizabilityAdminSummaryResponse = z.infer<
  typeof auditjournalizabilityAdminSummaryResponseSchema
>

export const auditjournalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditjournalizabilityAdminActionSchema,
})
export type AuditjournalizabilityAdminActionRequest = z.infer<
  typeof auditjournalizabilityAdminActionRequestSchema
>

export const auditjournalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditjournalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: auditjournalizabilityAdminStatsSchema.optional(),
})
export type AuditjournalizabilityAdminActionResponse = z.infer<
  typeof auditjournalizabilityAdminActionResponseSchema
>
