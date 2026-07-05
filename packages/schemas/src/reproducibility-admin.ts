import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const reproducibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'run_workflows',
])
export type ReproducibilityAdminDomain = z.infer<typeof reproducibilityAdminDomainSchema>

export const reproducibilityAdminRecordSchema = z.object({
  domain: reproducibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReproducibilityAdminRecord = z.infer<typeof reproducibilityAdminRecordSchema>

export const reproducibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  reproducibilityPercent: z.number().min(0).max(100),
})
export type ReproducibilityAdminStats = z.infer<typeof reproducibilityAdminStatsSchema>

export const reproducibilityAdminActionSchema = z.enum(['refresh_reproducibility_summary'])
export type ReproducibilityAdminAction = z.infer<typeof reproducibilityAdminActionSchema>

export const reproducibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(reproducibilityAdminRecordSchema),
  stats: reproducibilityAdminStatsSchema,
  availableActions: z.array(reproducibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReproducibilityAdminSummaryResponse = z.infer<
  typeof reproducibilityAdminSummaryResponseSchema
>

export const reproducibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reproducibilityAdminActionSchema,
})
export type ReproducibilityAdminActionRequest = z.infer<
  typeof reproducibilityAdminActionRequestSchema
>

export const reproducibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: reproducibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: reproducibilityAdminStatsSchema.optional(),
})
export type ReproducibilityAdminActionResponse = z.infer<
  typeof reproducibilityAdminActionResponseSchema
>
