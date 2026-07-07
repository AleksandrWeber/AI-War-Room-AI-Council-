import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const audittrailizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type AudittrailizabilityAdminDomain = z.infer<typeof audittrailizabilityAdminDomainSchema>

export const audittrailizabilityAdminRecordSchema = z.object({
  domain: audittrailizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AudittrailizabilityAdminRecord = z.infer<typeof audittrailizabilityAdminRecordSchema>

export const audittrailizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  audittrailizabilityPercent: z.number().min(0).max(100),
})
export type AudittrailizabilityAdminStats = z.infer<typeof audittrailizabilityAdminStatsSchema>

export const audittrailizabilityAdminActionSchema = z.enum(['refresh_audittrailizability_summary'])
export type AudittrailizabilityAdminAction = z.infer<typeof audittrailizabilityAdminActionSchema>

export const audittrailizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(audittrailizabilityAdminRecordSchema),
  stats: audittrailizabilityAdminStatsSchema,
  availableActions: z.array(audittrailizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AudittrailizabilityAdminSummaryResponse = z.infer<
  typeof audittrailizabilityAdminSummaryResponseSchema
>

export const audittrailizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: audittrailizabilityAdminActionSchema,
})
export type AudittrailizabilityAdminActionRequest = z.infer<
  typeof audittrailizabilityAdminActionRequestSchema
>

export const audittrailizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: audittrailizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: audittrailizabilityAdminStatsSchema.optional(),
})
export type AudittrailizabilityAdminActionResponse = z.infer<
  typeof audittrailizabilityAdminActionResponseSchema
>
