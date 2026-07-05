import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const terminologizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type TerminologizabilityAdminDomain = z.infer<typeof terminologizabilityAdminDomainSchema>

export const terminologizabilityAdminRecordSchema = z.object({
  domain: terminologizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TerminologizabilityAdminRecord = z.infer<typeof terminologizabilityAdminRecordSchema>

export const terminologizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  terminologizabilityPercent: z.number().min(0).max(100),
})
export type TerminologizabilityAdminStats = z.infer<typeof terminologizabilityAdminStatsSchema>

export const terminologizabilityAdminActionSchema = z.enum(['refresh_terminologizability_summary'])
export type TerminologizabilityAdminAction = z.infer<typeof terminologizabilityAdminActionSchema>

export const terminologizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(terminologizabilityAdminRecordSchema),
  stats: terminologizabilityAdminStatsSchema,
  availableActions: z.array(terminologizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TerminologizabilityAdminSummaryResponse = z.infer<
  typeof terminologizabilityAdminSummaryResponseSchema
>

export const terminologizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: terminologizabilityAdminActionSchema,
})
export type TerminologizabilityAdminActionRequest = z.infer<
  typeof terminologizabilityAdminActionRequestSchema
>

export const terminologizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: terminologizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: terminologizabilityAdminStatsSchema.optional(),
})
export type TerminologizabilityAdminActionResponse = z.infer<
  typeof terminologizabilityAdminActionResponseSchema
>
