import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const compliancejournalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type CompliancejournalizabilityAdminDomain = z.infer<typeof compliancejournalizabilityAdminDomainSchema>

export const compliancejournalizabilityAdminRecordSchema = z.object({
  domain: compliancejournalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CompliancejournalizabilityAdminRecord = z.infer<typeof compliancejournalizabilityAdminRecordSchema>

export const compliancejournalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  compliancejournalizabilityPercent: z.number().min(0).max(100),
})
export type CompliancejournalizabilityAdminStats = z.infer<typeof compliancejournalizabilityAdminStatsSchema>

export const compliancejournalizabilityAdminActionSchema = z.enum(['refresh_compliancejournalizability_summary'])
export type CompliancejournalizabilityAdminAction = z.infer<typeof compliancejournalizabilityAdminActionSchema>

export const compliancejournalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(compliancejournalizabilityAdminRecordSchema),
  stats: compliancejournalizabilityAdminStatsSchema,
  availableActions: z.array(compliancejournalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CompliancejournalizabilityAdminSummaryResponse = z.infer<
  typeof compliancejournalizabilityAdminSummaryResponseSchema
>

export const compliancejournalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compliancejournalizabilityAdminActionSchema,
})
export type CompliancejournalizabilityAdminActionRequest = z.infer<
  typeof compliancejournalizabilityAdminActionRequestSchema
>

export const compliancejournalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compliancejournalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: compliancejournalizabilityAdminStatsSchema.optional(),
})
export type CompliancejournalizabilityAdminActionResponse = z.infer<
  typeof compliancejournalizabilityAdminActionResponseSchema
>
