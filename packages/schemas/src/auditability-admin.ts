import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const auditabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'billing_webhook_events',
])
export type AuditabilityAdminDomain = z.infer<typeof auditabilityAdminDomainSchema>

export const auditabilityAdminRecordSchema = z.object({
  domain: auditabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuditabilityAdminRecord = z.infer<typeof auditabilityAdminRecordSchema>

export const auditabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  auditabilityPercent: z.number().min(0).max(100),
})
export type AuditabilityAdminStats = z.infer<typeof auditabilityAdminStatsSchema>

export const auditabilityAdminActionSchema = z.enum(['refresh_auditability_summary'])
export type AuditabilityAdminAction = z.infer<typeof auditabilityAdminActionSchema>

export const auditabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(auditabilityAdminRecordSchema),
  stats: auditabilityAdminStatsSchema,
  availableActions: z.array(auditabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuditabilityAdminSummaryResponse = z.infer<
  typeof auditabilityAdminSummaryResponseSchema
>

export const auditabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditabilityAdminActionSchema,
})
export type AuditabilityAdminActionRequest = z.infer<
  typeof auditabilityAdminActionRequestSchema
>

export const auditabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: auditabilityAdminStatsSchema.optional(),
})
export type AuditabilityAdminActionResponse = z.infer<
  typeof auditabilityAdminActionResponseSchema
>
