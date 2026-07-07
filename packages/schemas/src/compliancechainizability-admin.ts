import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const compliancechainizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type CompliancechainizabilityAdminDomain = z.infer<typeof compliancechainizabilityAdminDomainSchema>

export const compliancechainizabilityAdminRecordSchema = z.object({
  domain: compliancechainizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CompliancechainizabilityAdminRecord = z.infer<typeof compliancechainizabilityAdminRecordSchema>

export const compliancechainizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  compliancechainizabilityPercent: z.number().min(0).max(100),
})
export type CompliancechainizabilityAdminStats = z.infer<typeof compliancechainizabilityAdminStatsSchema>

export const compliancechainizabilityAdminActionSchema = z.enum(['refresh_compliancechainizability_summary'])
export type CompliancechainizabilityAdminAction = z.infer<typeof compliancechainizabilityAdminActionSchema>

export const compliancechainizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(compliancechainizabilityAdminRecordSchema),
  stats: compliancechainizabilityAdminStatsSchema,
  availableActions: z.array(compliancechainizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CompliancechainizabilityAdminSummaryResponse = z.infer<
  typeof compliancechainizabilityAdminSummaryResponseSchema
>

export const compliancechainizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compliancechainizabilityAdminActionSchema,
})
export type CompliancechainizabilityAdminActionRequest = z.infer<
  typeof compliancechainizabilityAdminActionRequestSchema
>

export const compliancechainizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compliancechainizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: compliancechainizabilityAdminStatsSchema.optional(),
})
export type CompliancechainizabilityAdminActionResponse = z.infer<
  typeof compliancechainizabilityAdminActionResponseSchema
>
