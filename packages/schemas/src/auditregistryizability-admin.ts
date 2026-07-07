import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const auditregistryizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type AuditregistryizabilityAdminDomain = z.infer<typeof auditregistryizabilityAdminDomainSchema>

export const auditregistryizabilityAdminRecordSchema = z.object({
  domain: auditregistryizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuditregistryizabilityAdminRecord = z.infer<typeof auditregistryizabilityAdminRecordSchema>

export const auditregistryizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  auditregistryizabilityPercent: z.number().min(0).max(100),
})
export type AuditregistryizabilityAdminStats = z.infer<typeof auditregistryizabilityAdminStatsSchema>

export const auditregistryizabilityAdminActionSchema = z.enum(['refresh_auditregistryizability_summary'])
export type AuditregistryizabilityAdminAction = z.infer<typeof auditregistryizabilityAdminActionSchema>

export const auditregistryizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(auditregistryizabilityAdminRecordSchema),
  stats: auditregistryizabilityAdminStatsSchema,
  availableActions: z.array(auditregistryizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuditregistryizabilityAdminSummaryResponse = z.infer<
  typeof auditregistryizabilityAdminSummaryResponseSchema
>

export const auditregistryizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditregistryizabilityAdminActionSchema,
})
export type AuditregistryizabilityAdminActionRequest = z.infer<
  typeof auditregistryizabilityAdminActionRequestSchema
>

export const auditregistryizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditregistryizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: auditregistryizabilityAdminStatsSchema.optional(),
})
export type AuditregistryizabilityAdminActionResponse = z.infer<
  typeof auditregistryizabilityAdminActionResponseSchema
>
