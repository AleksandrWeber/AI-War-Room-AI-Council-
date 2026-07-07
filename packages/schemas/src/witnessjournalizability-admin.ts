import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const witnessjournalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type WitnessjournalizabilityAdminDomain = z.infer<typeof witnessjournalizabilityAdminDomainSchema>

export const witnessjournalizabilityAdminRecordSchema = z.object({
  domain: witnessjournalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type WitnessjournalizabilityAdminRecord = z.infer<typeof witnessjournalizabilityAdminRecordSchema>

export const witnessjournalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  witnessjournalizabilityPercent: z.number().min(0).max(100),
})
export type WitnessjournalizabilityAdminStats = z.infer<typeof witnessjournalizabilityAdminStatsSchema>

export const witnessjournalizabilityAdminActionSchema = z.enum(['refresh_witnessjournalizability_summary'])
export type WitnessjournalizabilityAdminAction = z.infer<typeof witnessjournalizabilityAdminActionSchema>

export const witnessjournalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(witnessjournalizabilityAdminRecordSchema),
  stats: witnessjournalizabilityAdminStatsSchema,
  availableActions: z.array(witnessjournalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type WitnessjournalizabilityAdminSummaryResponse = z.infer<
  typeof witnessjournalizabilityAdminSummaryResponseSchema
>

export const witnessjournalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: witnessjournalizabilityAdminActionSchema,
})
export type WitnessjournalizabilityAdminActionRequest = z.infer<
  typeof witnessjournalizabilityAdminActionRequestSchema
>

export const witnessjournalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: witnessjournalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: witnessjournalizabilityAdminStatsSchema.optional(),
})
export type WitnessjournalizabilityAdminActionResponse = z.infer<
  typeof witnessjournalizabilityAdminActionResponseSchema
>
