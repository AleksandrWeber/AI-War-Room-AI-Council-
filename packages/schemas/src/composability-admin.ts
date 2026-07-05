import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const composabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'agent_outputs',
])
export type ComposabilityAdminDomain = z.infer<typeof composabilityAdminDomainSchema>

export const composabilityAdminRecordSchema = z.object({
  domain: composabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ComposabilityAdminRecord = z.infer<typeof composabilityAdminRecordSchema>

export const composabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  composabilityPercent: z.number().min(0).max(100),
})
export type ComposabilityAdminStats = z.infer<typeof composabilityAdminStatsSchema>

export const composabilityAdminActionSchema = z.enum(['refresh_composability_summary'])
export type ComposabilityAdminAction = z.infer<typeof composabilityAdminActionSchema>

export const composabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(composabilityAdminRecordSchema),
  stats: composabilityAdminStatsSchema,
  availableActions: z.array(composabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ComposabilityAdminSummaryResponse = z.infer<
  typeof composabilityAdminSummaryResponseSchema
>

export const composabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: composabilityAdminActionSchema,
})
export type ComposabilityAdminActionRequest = z.infer<
  typeof composabilityAdminActionRequestSchema
>

export const composabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: composabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: composabilityAdminStatsSchema.optional(),
})
export type ComposabilityAdminActionResponse = z.infer<
  typeof composabilityAdminActionResponseSchema
>
