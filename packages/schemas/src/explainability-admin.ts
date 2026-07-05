import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const explainabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'moderator_syntheses',
  'artifacts',
])
export type ExplainabilityAdminDomain = z.infer<typeof explainabilityAdminDomainSchema>

export const explainabilityAdminRecordSchema = z.object({
  domain: explainabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ExplainabilityAdminRecord = z.infer<typeof explainabilityAdminRecordSchema>

export const explainabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  explainabilityPercent: z.number().min(0).max(100),
})
export type ExplainabilityAdminStats = z.infer<typeof explainabilityAdminStatsSchema>

export const explainabilityAdminActionSchema = z.enum(['refresh_explainability_summary'])
export type ExplainabilityAdminAction = z.infer<typeof explainabilityAdminActionSchema>

export const explainabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(explainabilityAdminRecordSchema),
  stats: explainabilityAdminStatsSchema,
  availableActions: z.array(explainabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ExplainabilityAdminSummaryResponse = z.infer<
  typeof explainabilityAdminSummaryResponseSchema
>

export const explainabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: explainabilityAdminActionSchema,
})
export type ExplainabilityAdminActionRequest = z.infer<
  typeof explainabilityAdminActionRequestSchema
>

export const explainabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: explainabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: explainabilityAdminStatsSchema.optional(),
})
export type ExplainabilityAdminActionResponse = z.infer<
  typeof explainabilityAdminActionResponseSchema
>
