import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const witnessledgerizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type WitnessledgerizabilityAdminDomain = z.infer<typeof witnessledgerizabilityAdminDomainSchema>

export const witnessledgerizabilityAdminRecordSchema = z.object({
  domain: witnessledgerizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type WitnessledgerizabilityAdminRecord = z.infer<typeof witnessledgerizabilityAdminRecordSchema>

export const witnessledgerizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  witnessledgerizabilityPercent: z.number().min(0).max(100),
})
export type WitnessledgerizabilityAdminStats = z.infer<typeof witnessledgerizabilityAdminStatsSchema>

export const witnessledgerizabilityAdminActionSchema = z.enum(['refresh_witnessledgerizability_summary'])
export type WitnessledgerizabilityAdminAction = z.infer<typeof witnessledgerizabilityAdminActionSchema>

export const witnessledgerizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(witnessledgerizabilityAdminRecordSchema),
  stats: witnessledgerizabilityAdminStatsSchema,
  availableActions: z.array(witnessledgerizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type WitnessledgerizabilityAdminSummaryResponse = z.infer<
  typeof witnessledgerizabilityAdminSummaryResponseSchema
>

export const witnessledgerizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: witnessledgerizabilityAdminActionSchema,
})
export type WitnessledgerizabilityAdminActionRequest = z.infer<
  typeof witnessledgerizabilityAdminActionRequestSchema
>

export const witnessledgerizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: witnessledgerizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: witnessledgerizabilityAdminStatsSchema.optional(),
})
export type WitnessledgerizabilityAdminActionResponse = z.infer<
  typeof witnessledgerizabilityAdminActionResponseSchema
>
