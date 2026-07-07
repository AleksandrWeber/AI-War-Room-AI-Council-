import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const auditabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type AuditabilityvaultizabilityAdminDomain = z.infer<typeof auditabilityvaultizabilityAdminDomainSchema>

export const auditabilityvaultizabilityAdminRecordSchema = z.object({
  domain: auditabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuditabilityvaultizabilityAdminRecord = z.infer<typeof auditabilityvaultizabilityAdminRecordSchema>

export const auditabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  auditabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type AuditabilityvaultizabilityAdminStats = z.infer<typeof auditabilityvaultizabilityAdminStatsSchema>

export const auditabilityvaultizabilityAdminActionSchema = z.enum(['refresh_auditabilityvaultizability_summary'])
export type AuditabilityvaultizabilityAdminAction = z.infer<typeof auditabilityvaultizabilityAdminActionSchema>

export const auditabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(auditabilityvaultizabilityAdminRecordSchema),
  stats: auditabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(auditabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuditabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof auditabilityvaultizabilityAdminSummaryResponseSchema
>

export const auditabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditabilityvaultizabilityAdminActionSchema,
})
export type AuditabilityvaultizabilityAdminActionRequest = z.infer<
  typeof auditabilityvaultizabilityAdminActionRequestSchema
>

export const auditabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: auditabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: auditabilityvaultizabilityAdminStatsSchema.optional(),
})
export type AuditabilityvaultizabilityAdminActionResponse = z.infer<
  typeof auditabilityvaultizabilityAdminActionResponseSchema
>
