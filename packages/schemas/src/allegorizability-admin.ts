import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const allegorizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type AllegorizabilityAdminDomain = z.infer<typeof allegorizabilityAdminDomainSchema>

export const allegorizabilityAdminRecordSchema = z.object({
  domain: allegorizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AllegorizabilityAdminRecord = z.infer<typeof allegorizabilityAdminRecordSchema>

export const allegorizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  allegorizabilityPercent: z.number().min(0).max(100),
})
export type AllegorizabilityAdminStats = z.infer<typeof allegorizabilityAdminStatsSchema>

export const allegorizabilityAdminActionSchema = z.enum(['refresh_allegorizability_summary'])
export type AllegorizabilityAdminAction = z.infer<typeof allegorizabilityAdminActionSchema>

export const allegorizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(allegorizabilityAdminRecordSchema),
  stats: allegorizabilityAdminStatsSchema,
  availableActions: z.array(allegorizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AllegorizabilityAdminSummaryResponse = z.infer<
  typeof allegorizabilityAdminSummaryResponseSchema
>

export const allegorizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: allegorizabilityAdminActionSchema,
})
export type AllegorizabilityAdminActionRequest = z.infer<
  typeof allegorizabilityAdminActionRequestSchema
>

export const allegorizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: allegorizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: allegorizabilityAdminStatsSchema.optional(),
})
export type AllegorizabilityAdminActionResponse = z.infer<
  typeof allegorizabilityAdminActionResponseSchema
>
