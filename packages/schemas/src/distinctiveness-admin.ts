import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const distinctivenessAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type DistinctivenessAdminDomain = z.infer<typeof distinctivenessAdminDomainSchema>

export const distinctivenessAdminRecordSchema = z.object({
  domain: distinctivenessAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DistinctivenessAdminRecord = z.infer<typeof distinctivenessAdminRecordSchema>

export const distinctivenessAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  distinctivenessPercent: z.number().min(0).max(100),
})
export type DistinctivenessAdminStats = z.infer<typeof distinctivenessAdminStatsSchema>

export const distinctivenessAdminActionSchema = z.enum(['refresh_distinctiveness_summary'])
export type DistinctivenessAdminAction = z.infer<typeof distinctivenessAdminActionSchema>

export const distinctivenessAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(distinctivenessAdminRecordSchema),
  stats: distinctivenessAdminStatsSchema,
  availableActions: z.array(distinctivenessAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DistinctivenessAdminSummaryResponse = z.infer<
  typeof distinctivenessAdminSummaryResponseSchema
>

export const distinctivenessAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: distinctivenessAdminActionSchema,
})
export type DistinctivenessAdminActionRequest = z.infer<
  typeof distinctivenessAdminActionRequestSchema
>

export const distinctivenessAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: distinctivenessAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: distinctivenessAdminStatsSchema.optional(),
})
export type DistinctivenessAdminActionResponse = z.infer<
  typeof distinctivenessAdminActionResponseSchema
>
