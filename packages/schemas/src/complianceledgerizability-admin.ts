import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const complianceledgerizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ComplianceledgerizabilityAdminDomain = z.infer<typeof complianceledgerizabilityAdminDomainSchema>

export const complianceledgerizabilityAdminRecordSchema = z.object({
  domain: complianceledgerizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ComplianceledgerizabilityAdminRecord = z.infer<typeof complianceledgerizabilityAdminRecordSchema>

export const complianceledgerizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  complianceledgerizabilityPercent: z.number().min(0).max(100),
})
export type ComplianceledgerizabilityAdminStats = z.infer<typeof complianceledgerizabilityAdminStatsSchema>

export const complianceledgerizabilityAdminActionSchema = z.enum(['refresh_complianceledgerizability_summary'])
export type ComplianceledgerizabilityAdminAction = z.infer<typeof complianceledgerizabilityAdminActionSchema>

export const complianceledgerizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(complianceledgerizabilityAdminRecordSchema),
  stats: complianceledgerizabilityAdminStatsSchema,
  availableActions: z.array(complianceledgerizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ComplianceledgerizabilityAdminSummaryResponse = z.infer<
  typeof complianceledgerizabilityAdminSummaryResponseSchema
>

export const complianceledgerizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: complianceledgerizabilityAdminActionSchema,
})
export type ComplianceledgerizabilityAdminActionRequest = z.infer<
  typeof complianceledgerizabilityAdminActionRequestSchema
>

export const complianceledgerizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: complianceledgerizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: complianceledgerizabilityAdminStatsSchema.optional(),
})
export type ComplianceledgerizabilityAdminActionResponse = z.infer<
  typeof complianceledgerizabilityAdminActionResponseSchema
>
