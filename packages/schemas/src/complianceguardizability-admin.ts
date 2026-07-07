import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const complianceguardizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type ComplianceguardizabilityAdminDomain = z.infer<typeof complianceguardizabilityAdminDomainSchema>

export const complianceguardizabilityAdminRecordSchema = z.object({
  domain: complianceguardizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ComplianceguardizabilityAdminRecord = z.infer<typeof complianceguardizabilityAdminRecordSchema>

export const complianceguardizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  complianceguardizabilityPercent: z.number().min(0).max(100),
})
export type ComplianceguardizabilityAdminStats = z.infer<typeof complianceguardizabilityAdminStatsSchema>

export const complianceguardizabilityAdminActionSchema = z.enum(['refresh_complianceguardizability_summary'])
export type ComplianceguardizabilityAdminAction = z.infer<typeof complianceguardizabilityAdminActionSchema>

export const complianceguardizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(complianceguardizabilityAdminRecordSchema),
  stats: complianceguardizabilityAdminStatsSchema,
  availableActions: z.array(complianceguardizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ComplianceguardizabilityAdminSummaryResponse = z.infer<
  typeof complianceguardizabilityAdminSummaryResponseSchema
>

export const complianceguardizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: complianceguardizabilityAdminActionSchema,
})
export type ComplianceguardizabilityAdminActionRequest = z.infer<
  typeof complianceguardizabilityAdminActionRequestSchema
>

export const complianceguardizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: complianceguardizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: complianceguardizabilityAdminStatsSchema.optional(),
})
export type ComplianceguardizabilityAdminActionResponse = z.infer<
  typeof complianceguardizabilityAdminActionResponseSchema
>
