import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const durabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'artifacts',
  'usage_events',
  'idempotency_keys',
])
export type DurabilityAdminDomain = z.infer<
  typeof durabilityAdminDomainSchema
>

export const durabilityAdminRecordSchema = z.object({
  domain: durabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DurabilityAdminRecord = z.infer<
  typeof durabilityAdminRecordSchema
>

export const durabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  durabilityPercent: z.number().min(0).max(100),
})
export type DurabilityAdminStats = z.infer<typeof durabilityAdminStatsSchema>

export const durabilityAdminActionSchema = z.enum([
  'refresh_durability_summary',
])
export type DurabilityAdminAction = z.infer<
  typeof durabilityAdminActionSchema
>

export const durabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(durabilityAdminRecordSchema),
  stats: durabilityAdminStatsSchema,
  availableActions: z.array(durabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DurabilityAdminSummaryResponse = z.infer<
  typeof durabilityAdminSummaryResponseSchema
>

export const durabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: durabilityAdminActionSchema,
})
export type DurabilityAdminActionRequest = z.infer<
  typeof durabilityAdminActionRequestSchema
>

export const durabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: durabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: durabilityAdminStatsSchema.optional(),
})
export type DurabilityAdminActionResponse = z.infer<
  typeof durabilityAdminActionResponseSchema
>
