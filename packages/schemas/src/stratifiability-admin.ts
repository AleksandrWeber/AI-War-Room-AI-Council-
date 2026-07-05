import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const stratifiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type StratifiabilityAdminDomain = z.infer<typeof stratifiabilityAdminDomainSchema>

export const stratifiabilityAdminRecordSchema = z.object({
  domain: stratifiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type StratifiabilityAdminRecord = z.infer<typeof stratifiabilityAdminRecordSchema>

export const stratifiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  stratifiabilityPercent: z.number().min(0).max(100),
})
export type StratifiabilityAdminStats = z.infer<typeof stratifiabilityAdminStatsSchema>

export const stratifiabilityAdminActionSchema = z.enum(['refresh_stratifiability_summary'])
export type StratifiabilityAdminAction = z.infer<typeof stratifiabilityAdminActionSchema>

export const stratifiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(stratifiabilityAdminRecordSchema),
  stats: stratifiabilityAdminStatsSchema,
  availableActions: z.array(stratifiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type StratifiabilityAdminSummaryResponse = z.infer<
  typeof stratifiabilityAdminSummaryResponseSchema
>

export const stratifiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: stratifiabilityAdminActionSchema,
})
export type StratifiabilityAdminActionRequest = z.infer<
  typeof stratifiabilityAdminActionRequestSchema
>

export const stratifiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: stratifiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: stratifiabilityAdminStatsSchema.optional(),
})
export type StratifiabilityAdminActionResponse = z.infer<
  typeof stratifiabilityAdminActionResponseSchema
>
