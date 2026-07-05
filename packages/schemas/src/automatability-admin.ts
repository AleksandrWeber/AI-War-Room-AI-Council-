import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const automatabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'agent_outputs',
  'artifacts',
])
export type AutomatabilityAdminDomain = z.infer<typeof automatabilityAdminDomainSchema>

export const automatabilityAdminRecordSchema = z.object({
  domain: automatabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AutomatabilityAdminRecord = z.infer<typeof automatabilityAdminRecordSchema>

export const automatabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  automatabilityPercent: z.number().min(0).max(100),
})
export type AutomatabilityAdminStats = z.infer<typeof automatabilityAdminStatsSchema>

export const automatabilityAdminActionSchema = z.enum(['refresh_automatability_summary'])
export type AutomatabilityAdminAction = z.infer<typeof automatabilityAdminActionSchema>

export const automatabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(automatabilityAdminRecordSchema),
  stats: automatabilityAdminStatsSchema,
  availableActions: z.array(automatabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AutomatabilityAdminSummaryResponse = z.infer<
  typeof automatabilityAdminSummaryResponseSchema
>

export const automatabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: automatabilityAdminActionSchema,
})
export type AutomatabilityAdminActionRequest = z.infer<
  typeof automatabilityAdminActionRequestSchema
>

export const automatabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: automatabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: automatabilityAdminStatsSchema.optional(),
})
export type AutomatabilityAdminActionResponse = z.infer<
  typeof automatabilityAdminActionResponseSchema
>
