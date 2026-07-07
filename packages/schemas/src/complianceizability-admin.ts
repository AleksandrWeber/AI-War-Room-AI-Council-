import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const complianceizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ComplianceizabilityAdminDomain = z.infer<typeof complianceizabilityAdminDomainSchema>

export const complianceizabilityAdminRecordSchema = z.object({
  domain: complianceizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ComplianceizabilityAdminRecord = z.infer<typeof complianceizabilityAdminRecordSchema>

export const complianceizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  complianceizabilityPercent: z.number().min(0).max(100),
})
export type ComplianceizabilityAdminStats = z.infer<typeof complianceizabilityAdminStatsSchema>

export const complianceizabilityAdminActionSchema = z.enum(['refresh_complianceizability_summary'])
export type ComplianceizabilityAdminAction = z.infer<typeof complianceizabilityAdminActionSchema>

export const complianceizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(complianceizabilityAdminRecordSchema),
  stats: complianceizabilityAdminStatsSchema,
  availableActions: z.array(complianceizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ComplianceizabilityAdminSummaryResponse = z.infer<
  typeof complianceizabilityAdminSummaryResponseSchema
>

export const complianceizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: complianceizabilityAdminActionSchema,
})
export type ComplianceizabilityAdminActionRequest = z.infer<
  typeof complianceizabilityAdminActionRequestSchema
>

export const complianceizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: complianceizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: complianceizabilityAdminStatsSchema.optional(),
})
export type ComplianceizabilityAdminActionResponse = z.infer<
  typeof complianceizabilityAdminActionResponseSchema
>
