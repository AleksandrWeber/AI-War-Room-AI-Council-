import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const auditTrailAdminDomainSchema = z.enum([
  'usage_events',
  'billing_webhook_events',
  'billing_notifications',
  'meter_usage_reports',
])
export type AuditTrailAdminDomain = z.infer<typeof auditTrailAdminDomainSchema>

export const auditTrailAdminRecordSchema = z.object({
  domain: auditTrailAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuditTrailAdminRecord = z.infer<typeof auditTrailAdminRecordSchema>

export const auditTrailAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  supportsWorkspaceAuditExport: z.literal(true),
})
export type AuditTrailAdminStats = z.infer<typeof auditTrailAdminStatsSchema>

export const auditTrailAdminActionSchema = z.enum(['refresh_audit_summary'])
export type AuditTrailAdminAction = z.infer<typeof auditTrailAdminActionSchema>

export const auditTrailAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(auditTrailAdminRecordSchema),
  stats: auditTrailAdminStatsSchema,
  availableActions: z.array(auditTrailAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuditTrailAdminSummaryResponse = z.infer<
  typeof auditTrailAdminSummaryResponseSchema
>

export const auditTrailAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditTrailAdminActionSchema,
})
export type AuditTrailAdminActionRequest = z.infer<
  typeof auditTrailAdminActionRequestSchema
>

export const auditTrailAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditTrailAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: auditTrailAdminStatsSchema.optional(),
})
export type AuditTrailAdminActionResponse = z.infer<
  typeof auditTrailAdminActionResponseSchema
>
