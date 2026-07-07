import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const auditingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type AuditingizabilityAdminDomain = z.infer<typeof auditingizabilityAdminDomainSchema>

export const auditingizabilityAdminRecordSchema = z.object({
  domain: auditingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuditingizabilityAdminRecord = z.infer<typeof auditingizabilityAdminRecordSchema>

export const auditingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  auditingizabilityPercent: z.number().min(0).max(100),
})
export type AuditingizabilityAdminStats = z.infer<typeof auditingizabilityAdminStatsSchema>

export const auditingizabilityAdminActionSchema = z.enum(['refresh_auditingizability_summary'])
export type AuditingizabilityAdminAction = z.infer<typeof auditingizabilityAdminActionSchema>

export const auditingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(auditingizabilityAdminRecordSchema),
  stats: auditingizabilityAdminStatsSchema,
  availableActions: z.array(auditingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuditingizabilityAdminSummaryResponse = z.infer<
  typeof auditingizabilityAdminSummaryResponseSchema
>

export const auditingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditingizabilityAdminActionSchema,
})
export type AuditingizabilityAdminActionRequest = z.infer<
  typeof auditingizabilityAdminActionRequestSchema
>

export const auditingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: auditingizabilityAdminStatsSchema.optional(),
})
export type AuditingizabilityAdminActionResponse = z.infer<
  typeof auditingizabilityAdminActionResponseSchema
>
