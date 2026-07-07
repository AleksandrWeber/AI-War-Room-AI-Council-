import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const explainabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type ExplainabilityvaultizabilityAdminDomain = z.infer<typeof explainabilityvaultizabilityAdminDomainSchema>

export const explainabilityvaultizabilityAdminRecordSchema = z.object({
  domain: explainabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ExplainabilityvaultizabilityAdminRecord = z.infer<typeof explainabilityvaultizabilityAdminRecordSchema>

export const explainabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  explainabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ExplainabilityvaultizabilityAdminStats = z.infer<typeof explainabilityvaultizabilityAdminStatsSchema>

export const explainabilityvaultizabilityAdminActionSchema = z.enum(['refresh_explainabilityvaultizability_summary'])
export type ExplainabilityvaultizabilityAdminAction = z.infer<typeof explainabilityvaultizabilityAdminActionSchema>

export const explainabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(explainabilityvaultizabilityAdminRecordSchema),
  stats: explainabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(explainabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ExplainabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof explainabilityvaultizabilityAdminSummaryResponseSchema
>

export const explainabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: explainabilityvaultizabilityAdminActionSchema,
})
export type ExplainabilityvaultizabilityAdminActionRequest = z.infer<
  typeof explainabilityvaultizabilityAdminActionRequestSchema
>

export const explainabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: explainabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: explainabilityvaultizabilityAdminStatsSchema.optional(),
})
export type ExplainabilityvaultizabilityAdminActionResponse = z.infer<
  typeof explainabilityvaultizabilityAdminActionResponseSchema
>
