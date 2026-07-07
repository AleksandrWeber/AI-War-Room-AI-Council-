import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const auditlineizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type AuditlineizabilityAdminDomain = z.infer<typeof auditlineizabilityAdminDomainSchema>

export const auditlineizabilityAdminRecordSchema = z.object({
  domain: auditlineizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuditlineizabilityAdminRecord = z.infer<typeof auditlineizabilityAdminRecordSchema>

export const auditlineizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  auditlineizabilityPercent: z.number().min(0).max(100),
})
export type AuditlineizabilityAdminStats = z.infer<typeof auditlineizabilityAdminStatsSchema>

export const auditlineizabilityAdminActionSchema = z.enum(['refresh_auditlineizability_summary'])
export type AuditlineizabilityAdminAction = z.infer<typeof auditlineizabilityAdminActionSchema>

export const auditlineizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(auditlineizabilityAdminRecordSchema),
  stats: auditlineizabilityAdminStatsSchema,
  availableActions: z.array(auditlineizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuditlineizabilityAdminSummaryResponse = z.infer<
  typeof auditlineizabilityAdminSummaryResponseSchema
>

export const auditlineizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditlineizabilityAdminActionSchema,
})
export type AuditlineizabilityAdminActionRequest = z.infer<
  typeof auditlineizabilityAdminActionRequestSchema
>

export const auditlineizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditlineizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: auditlineizabilityAdminStatsSchema.optional(),
})
export type AuditlineizabilityAdminActionResponse = z.infer<
  typeof auditlineizabilityAdminActionResponseSchema
>
