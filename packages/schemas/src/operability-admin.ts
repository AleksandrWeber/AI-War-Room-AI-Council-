import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const operabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_records',
])
export type OperabilityAdminDomain = z.infer<typeof operabilityAdminDomainSchema>

export const operabilityAdminRecordSchema = z.object({
  domain: operabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OperabilityAdminRecord = z.infer<typeof operabilityAdminRecordSchema>

export const operabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  operabilityPercent: z.number().min(0).max(100),
})
export type OperabilityAdminStats = z.infer<typeof operabilityAdminStatsSchema>

export const operabilityAdminActionSchema = z.enum(['refresh_operability_summary'])
export type OperabilityAdminAction = z.infer<typeof operabilityAdminActionSchema>

export const operabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(operabilityAdminRecordSchema),
  stats: operabilityAdminStatsSchema,
  availableActions: z.array(operabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OperabilityAdminSummaryResponse = z.infer<
  typeof operabilityAdminSummaryResponseSchema
>

export const operabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: operabilityAdminActionSchema,
})
export type OperabilityAdminActionRequest = z.infer<
  typeof operabilityAdminActionRequestSchema
>

export const operabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: operabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: operabilityAdminStatsSchema.optional(),
})
export type OperabilityAdminActionResponse = z.infer<
  typeof operabilityAdminActionResponseSchema
>
