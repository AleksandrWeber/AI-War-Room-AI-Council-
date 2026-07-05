import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const flexibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'usage_events',
])
export type FlexibilityAdminDomain = z.infer<typeof flexibilityAdminDomainSchema>

export const flexibilityAdminRecordSchema = z.object({
  domain: flexibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FlexibilityAdminRecord = z.infer<typeof flexibilityAdminRecordSchema>

export const flexibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  flexibilityPercent: z.number().min(0).max(100),
})
export type FlexibilityAdminStats = z.infer<typeof flexibilityAdminStatsSchema>

export const flexibilityAdminActionSchema = z.enum(['refresh_flexibility_summary'])
export type FlexibilityAdminAction = z.infer<typeof flexibilityAdminActionSchema>

export const flexibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(flexibilityAdminRecordSchema),
  stats: flexibilityAdminStatsSchema,
  availableActions: z.array(flexibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FlexibilityAdminSummaryResponse = z.infer<
  typeof flexibilityAdminSummaryResponseSchema
>

export const flexibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: flexibilityAdminActionSchema,
})
export type FlexibilityAdminActionRequest = z.infer<
  typeof flexibilityAdminActionRequestSchema
>

export const flexibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: flexibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: flexibilityAdminStatsSchema.optional(),
})
export type FlexibilityAdminActionResponse = z.infer<
  typeof flexibilityAdminActionResponseSchema
>
