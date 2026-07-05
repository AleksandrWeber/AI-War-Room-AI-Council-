import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const normalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type NormalizabilityAdminDomain = z.infer<typeof normalizabilityAdminDomainSchema>

export const normalizabilityAdminRecordSchema = z.object({
  domain: normalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NormalizabilityAdminRecord = z.infer<typeof normalizabilityAdminRecordSchema>

export const normalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  normalizabilityPercent: z.number().min(0).max(100),
})
export type NormalizabilityAdminStats = z.infer<typeof normalizabilityAdminStatsSchema>

export const normalizabilityAdminActionSchema = z.enum(['refresh_normalizability_summary'])
export type NormalizabilityAdminAction = z.infer<typeof normalizabilityAdminActionSchema>

export const normalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(normalizabilityAdminRecordSchema),
  stats: normalizabilityAdminStatsSchema,
  availableActions: z.array(normalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NormalizabilityAdminSummaryResponse = z.infer<
  typeof normalizabilityAdminSummaryResponseSchema
>

export const normalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: normalizabilityAdminActionSchema,
})
export type NormalizabilityAdminActionRequest = z.infer<
  typeof normalizabilityAdminActionRequestSchema
>

export const normalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: normalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: normalizabilityAdminStatsSchema.optional(),
})
export type NormalizabilityAdminActionResponse = z.infer<
  typeof normalizabilityAdminActionResponseSchema
>
