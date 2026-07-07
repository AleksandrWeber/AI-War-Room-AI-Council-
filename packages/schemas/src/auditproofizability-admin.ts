import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const auditproofizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type AuditproofizabilityAdminDomain = z.infer<typeof auditproofizabilityAdminDomainSchema>

export const auditproofizabilityAdminRecordSchema = z.object({
  domain: auditproofizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuditproofizabilityAdminRecord = z.infer<typeof auditproofizabilityAdminRecordSchema>

export const auditproofizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  auditproofizabilityPercent: z.number().min(0).max(100),
})
export type AuditproofizabilityAdminStats = z.infer<typeof auditproofizabilityAdminStatsSchema>

export const auditproofizabilityAdminActionSchema = z.enum(['refresh_auditproofizability_summary'])
export type AuditproofizabilityAdminAction = z.infer<typeof auditproofizabilityAdminActionSchema>

export const auditproofizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(auditproofizabilityAdminRecordSchema),
  stats: auditproofizabilityAdminStatsSchema,
  availableActions: z.array(auditproofizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuditproofizabilityAdminSummaryResponse = z.infer<
  typeof auditproofizabilityAdminSummaryResponseSchema
>

export const auditproofizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditproofizabilityAdminActionSchema,
})
export type AuditproofizabilityAdminActionRequest = z.infer<
  typeof auditproofizabilityAdminActionRequestSchema
>

export const auditproofizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditproofizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: auditproofizabilityAdminStatsSchema.optional(),
})
export type AuditproofizabilityAdminActionResponse = z.infer<
  typeof auditproofizabilityAdminActionResponseSchema
>
