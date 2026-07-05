import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const parametrizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type ParametrizabilityAdminDomain = z.infer<typeof parametrizabilityAdminDomainSchema>

export const parametrizabilityAdminRecordSchema = z.object({
  domain: parametrizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ParametrizabilityAdminRecord = z.infer<typeof parametrizabilityAdminRecordSchema>

export const parametrizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  parametrizabilityPercent: z.number().min(0).max(100),
})
export type ParametrizabilityAdminStats = z.infer<typeof parametrizabilityAdminStatsSchema>

export const parametrizabilityAdminActionSchema = z.enum(['refresh_parametrizability_summary'])
export type ParametrizabilityAdminAction = z.infer<typeof parametrizabilityAdminActionSchema>

export const parametrizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(parametrizabilityAdminRecordSchema),
  stats: parametrizabilityAdminStatsSchema,
  availableActions: z.array(parametrizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ParametrizabilityAdminSummaryResponse = z.infer<
  typeof parametrizabilityAdminSummaryResponseSchema
>

export const parametrizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: parametrizabilityAdminActionSchema,
})
export type ParametrizabilityAdminActionRequest = z.infer<
  typeof parametrizabilityAdminActionRequestSchema
>

export const parametrizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: parametrizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: parametrizabilityAdminStatsSchema.optional(),
})
export type ParametrizabilityAdminActionResponse = z.infer<
  typeof parametrizabilityAdminActionResponseSchema
>
