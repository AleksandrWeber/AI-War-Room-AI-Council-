import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const confidentialityizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ConfidentialityizabilityAdminDomain = z.infer<typeof confidentialityizabilityAdminDomainSchema>

export const confidentialityizabilityAdminRecordSchema = z.object({
  domain: confidentialityizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConfidentialityizabilityAdminRecord = z.infer<typeof confidentialityizabilityAdminRecordSchema>

export const confidentialityizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  confidentialityizabilityPercent: z.number().min(0).max(100),
})
export type ConfidentialityizabilityAdminStats = z.infer<typeof confidentialityizabilityAdminStatsSchema>

export const confidentialityizabilityAdminActionSchema = z.enum(['refresh_confidentialityizability_summary'])
export type ConfidentialityizabilityAdminAction = z.infer<typeof confidentialityizabilityAdminActionSchema>

export const confidentialityizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(confidentialityizabilityAdminRecordSchema),
  stats: confidentialityizabilityAdminStatsSchema,
  availableActions: z.array(confidentialityizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConfidentialityizabilityAdminSummaryResponse = z.infer<
  typeof confidentialityizabilityAdminSummaryResponseSchema
>

export const confidentialityizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: confidentialityizabilityAdminActionSchema,
})
export type ConfidentialityizabilityAdminActionRequest = z.infer<
  typeof confidentialityizabilityAdminActionRequestSchema
>

export const confidentialityizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: confidentialityizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: confidentialityizabilityAdminStatsSchema.optional(),
})
export type ConfidentialityizabilityAdminActionResponse = z.infer<
  typeof confidentialityizabilityAdminActionResponseSchema
>
