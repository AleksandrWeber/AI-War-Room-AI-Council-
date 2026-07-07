import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const policyizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type PolicyizabilityAdminDomain = z.infer<typeof policyizabilityAdminDomainSchema>

export const policyizabilityAdminRecordSchema = z.object({
  domain: policyizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PolicyizabilityAdminRecord = z.infer<typeof policyizabilityAdminRecordSchema>

export const policyizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  policyizabilityPercent: z.number().min(0).max(100),
})
export type PolicyizabilityAdminStats = z.infer<typeof policyizabilityAdminStatsSchema>

export const policyizabilityAdminActionSchema = z.enum(['refresh_policyizability_summary'])
export type PolicyizabilityAdminAction = z.infer<typeof policyizabilityAdminActionSchema>

export const policyizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(policyizabilityAdminRecordSchema),
  stats: policyizabilityAdminStatsSchema,
  availableActions: z.array(policyizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PolicyizabilityAdminSummaryResponse = z.infer<
  typeof policyizabilityAdminSummaryResponseSchema
>

export const policyizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: policyizabilityAdminActionSchema,
})
export type PolicyizabilityAdminActionRequest = z.infer<
  typeof policyizabilityAdminActionRequestSchema
>

export const policyizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: policyizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: policyizabilityAdminStatsSchema.optional(),
})
export type PolicyizabilityAdminActionResponse = z.infer<
  typeof policyizabilityAdminActionResponseSchema
>
