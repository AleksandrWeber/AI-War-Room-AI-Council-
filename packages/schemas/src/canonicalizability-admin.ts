import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const canonicalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type CanonicalizabilityAdminDomain = z.infer<typeof canonicalizabilityAdminDomainSchema>

export const canonicalizabilityAdminRecordSchema = z.object({
  domain: canonicalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CanonicalizabilityAdminRecord = z.infer<typeof canonicalizabilityAdminRecordSchema>

export const canonicalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  canonicalizabilityPercent: z.number().min(0).max(100),
})
export type CanonicalizabilityAdminStats = z.infer<typeof canonicalizabilityAdminStatsSchema>

export const canonicalizabilityAdminActionSchema = z.enum(['refresh_canonicalizability_summary'])
export type CanonicalizabilityAdminAction = z.infer<typeof canonicalizabilityAdminActionSchema>

export const canonicalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(canonicalizabilityAdminRecordSchema),
  stats: canonicalizabilityAdminStatsSchema,
  availableActions: z.array(canonicalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CanonicalizabilityAdminSummaryResponse = z.infer<
  typeof canonicalizabilityAdminSummaryResponseSchema
>

export const canonicalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: canonicalizabilityAdminActionSchema,
})
export type CanonicalizabilityAdminActionRequest = z.infer<
  typeof canonicalizabilityAdminActionRequestSchema
>

export const canonicalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: canonicalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: canonicalizabilityAdminStatsSchema.optional(),
})
export type CanonicalizabilityAdminActionResponse = z.infer<
  typeof canonicalizabilityAdminActionResponseSchema
>
