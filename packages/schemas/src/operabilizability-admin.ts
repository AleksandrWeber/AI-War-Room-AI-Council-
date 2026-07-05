import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const operabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type OperabilizabilityAdminDomain = z.infer<typeof operabilizabilityAdminDomainSchema>

export const operabilizabilityAdminRecordSchema = z.object({
  domain: operabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OperabilizabilityAdminRecord = z.infer<typeof operabilizabilityAdminRecordSchema>

export const operabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  operabilizabilityPercent: z.number().min(0).max(100),
})
export type OperabilizabilityAdminStats = z.infer<typeof operabilizabilityAdminStatsSchema>

export const operabilizabilityAdminActionSchema = z.enum(['refresh_operabilizability_summary'])
export type OperabilizabilityAdminAction = z.infer<typeof operabilizabilityAdminActionSchema>

export const operabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(operabilizabilityAdminRecordSchema),
  stats: operabilizabilityAdminStatsSchema,
  availableActions: z.array(operabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OperabilizabilityAdminSummaryResponse = z.infer<
  typeof operabilizabilityAdminSummaryResponseSchema
>

export const operabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: operabilizabilityAdminActionSchema,
})
export type OperabilizabilityAdminActionRequest = z.infer<
  typeof operabilizabilityAdminActionRequestSchema
>

export const operabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: operabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: operabilizabilityAdminStatsSchema.optional(),
})
export type OperabilizabilityAdminActionResponse = z.infer<
  typeof operabilizabilityAdminActionResponseSchema
>
