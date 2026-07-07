import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const complianceproofizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type ComplianceproofizabilityAdminDomain = z.infer<typeof complianceproofizabilityAdminDomainSchema>

export const complianceproofizabilityAdminRecordSchema = z.object({
  domain: complianceproofizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ComplianceproofizabilityAdminRecord = z.infer<typeof complianceproofizabilityAdminRecordSchema>

export const complianceproofizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  complianceproofizabilityPercent: z.number().min(0).max(100),
})
export type ComplianceproofizabilityAdminStats = z.infer<typeof complianceproofizabilityAdminStatsSchema>

export const complianceproofizabilityAdminActionSchema = z.enum(['refresh_complianceproofizability_summary'])
export type ComplianceproofizabilityAdminAction = z.infer<typeof complianceproofizabilityAdminActionSchema>

export const complianceproofizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(complianceproofizabilityAdminRecordSchema),
  stats: complianceproofizabilityAdminStatsSchema,
  availableActions: z.array(complianceproofizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ComplianceproofizabilityAdminSummaryResponse = z.infer<
  typeof complianceproofizabilityAdminSummaryResponseSchema
>

export const complianceproofizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: complianceproofizabilityAdminActionSchema,
})
export type ComplianceproofizabilityAdminActionRequest = z.infer<
  typeof complianceproofizabilityAdminActionRequestSchema
>

export const complianceproofizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: complianceproofizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: complianceproofizabilityAdminStatsSchema.optional(),
})
export type ComplianceproofizabilityAdminActionResponse = z.infer<
  typeof complianceproofizabilityAdminActionResponseSchema
>
