import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const reliabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'model_health_events',
])
export type ReliabilityAdminDomain = z.infer<typeof reliabilityAdminDomainSchema>

export const reliabilityAdminRecordSchema = z.object({
  domain: reliabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReliabilityAdminRecord = z.infer<typeof reliabilityAdminRecordSchema>

export const reliabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  reliabilityPercent: z.number().min(0).max(100),
})
export type ReliabilityAdminStats = z.infer<typeof reliabilityAdminStatsSchema>

export const reliabilityAdminActionSchema = z.enum(['refresh_reliability_summary'])
export type ReliabilityAdminAction = z.infer<typeof reliabilityAdminActionSchema>

export const reliabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(reliabilityAdminRecordSchema),
  stats: reliabilityAdminStatsSchema,
  availableActions: z.array(reliabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReliabilityAdminSummaryResponse = z.infer<
  typeof reliabilityAdminSummaryResponseSchema
>

export const reliabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reliabilityAdminActionSchema,
})
export type ReliabilityAdminActionRequest = z.infer<
  typeof reliabilityAdminActionRequestSchema
>

export const reliabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reliabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: reliabilityAdminStatsSchema.optional(),
})
export type ReliabilityAdminActionResponse = z.infer<
  typeof reliabilityAdminActionResponseSchema
>
