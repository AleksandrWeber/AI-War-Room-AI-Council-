import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const legibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'run_workflows',
])
export type LegibilityAdminDomain = z.infer<typeof legibilityAdminDomainSchema>

export const legibilityAdminRecordSchema = z.object({
  domain: legibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type LegibilityAdminRecord = z.infer<typeof legibilityAdminRecordSchema>

export const legibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  legibilityPercent: z.number().min(0).max(100),
})
export type LegibilityAdminStats = z.infer<typeof legibilityAdminStatsSchema>

export const legibilityAdminActionSchema = z.enum(['refresh_legibility_summary'])
export type LegibilityAdminAction = z.infer<typeof legibilityAdminActionSchema>

export const legibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(legibilityAdminRecordSchema),
  stats: legibilityAdminStatsSchema,
  availableActions: z.array(legibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type LegibilityAdminSummaryResponse = z.infer<
  typeof legibilityAdminSummaryResponseSchema
>

export const legibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: legibilityAdminActionSchema,
})
export type LegibilityAdminActionRequest = z.infer<
  typeof legibilityAdminActionRequestSchema
>

export const legibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: legibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: legibilityAdminStatsSchema.optional(),
})
export type LegibilityAdminActionResponse = z.infer<
  typeof legibilityAdminActionResponseSchema
>
