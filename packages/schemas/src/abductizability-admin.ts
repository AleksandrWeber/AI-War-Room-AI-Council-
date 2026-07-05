import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const abductizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type AbductizabilityAdminDomain = z.infer<typeof abductizabilityAdminDomainSchema>

export const abductizabilityAdminRecordSchema = z.object({
  domain: abductizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AbductizabilityAdminRecord = z.infer<typeof abductizabilityAdminRecordSchema>

export const abductizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  abductizabilityPercent: z.number().min(0).max(100),
})
export type AbductizabilityAdminStats = z.infer<typeof abductizabilityAdminStatsSchema>

export const abductizabilityAdminActionSchema = z.enum(['refresh_abductizability_summary'])
export type AbductizabilityAdminAction = z.infer<typeof abductizabilityAdminActionSchema>

export const abductizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(abductizabilityAdminRecordSchema),
  stats: abductizabilityAdminStatsSchema,
  availableActions: z.array(abductizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AbductizabilityAdminSummaryResponse = z.infer<
  typeof abductizabilityAdminSummaryResponseSchema
>

export const abductizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: abductizabilityAdminActionSchema,
})
export type AbductizabilityAdminActionRequest = z.infer<
  typeof abductizabilityAdminActionRequestSchema
>

export const abductizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: abductizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: abductizabilityAdminStatsSchema.optional(),
})
export type AbductizabilityAdminActionResponse = z.infer<
  typeof abductizabilityAdminActionResponseSchema
>
