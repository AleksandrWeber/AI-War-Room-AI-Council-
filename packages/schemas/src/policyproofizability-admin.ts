import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const policyproofizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type PolicyproofizabilityAdminDomain = z.infer<typeof policyproofizabilityAdminDomainSchema>

export const policyproofizabilityAdminRecordSchema = z.object({
  domain: policyproofizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PolicyproofizabilityAdminRecord = z.infer<typeof policyproofizabilityAdminRecordSchema>

export const policyproofizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  policyproofizabilityPercent: z.number().min(0).max(100),
})
export type PolicyproofizabilityAdminStats = z.infer<typeof policyproofizabilityAdminStatsSchema>

export const policyproofizabilityAdminActionSchema = z.enum(['refresh_policyproofizability_summary'])
export type PolicyproofizabilityAdminAction = z.infer<typeof policyproofizabilityAdminActionSchema>

export const policyproofizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(policyproofizabilityAdminRecordSchema),
  stats: policyproofizabilityAdminStatsSchema,
  availableActions: z.array(policyproofizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PolicyproofizabilityAdminSummaryResponse = z.infer<
  typeof policyproofizabilityAdminSummaryResponseSchema
>

export const policyproofizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: policyproofizabilityAdminActionSchema,
})
export type PolicyproofizabilityAdminActionRequest = z.infer<
  typeof policyproofizabilityAdminActionRequestSchema
>

export const policyproofizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: policyproofizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: policyproofizabilityAdminStatsSchema.optional(),
})
export type PolicyproofizabilityAdminActionResponse = z.infer<
  typeof policyproofizabilityAdminActionResponseSchema
>
