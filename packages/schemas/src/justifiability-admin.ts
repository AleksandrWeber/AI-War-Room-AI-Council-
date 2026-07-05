import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const justifiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_reviews',
  'idempotency_keys',
])
export type JustifiabilityAdminDomain = z.infer<typeof justifiabilityAdminDomainSchema>

export const justifiabilityAdminRecordSchema = z.object({
  domain: justifiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type JustifiabilityAdminRecord = z.infer<typeof justifiabilityAdminRecordSchema>

export const justifiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  justifiabilityPercent: z.number().min(0).max(100),
})
export type JustifiabilityAdminStats = z.infer<typeof justifiabilityAdminStatsSchema>

export const justifiabilityAdminActionSchema = z.enum(['refresh_justifiability_summary'])
export type JustifiabilityAdminAction = z.infer<typeof justifiabilityAdminActionSchema>

export const justifiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(justifiabilityAdminRecordSchema),
  stats: justifiabilityAdminStatsSchema,
  availableActions: z.array(justifiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type JustifiabilityAdminSummaryResponse = z.infer<
  typeof justifiabilityAdminSummaryResponseSchema
>

export const justifiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: justifiabilityAdminActionSchema,
})
export type JustifiabilityAdminActionRequest = z.infer<
  typeof justifiabilityAdminActionRequestSchema
>

export const justifiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: justifiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: justifiabilityAdminStatsSchema.optional(),
})
export type JustifiabilityAdminActionResponse = z.infer<
  typeof justifiabilityAdminActionResponseSchema
>
