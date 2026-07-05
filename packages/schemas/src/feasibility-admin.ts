import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const feasibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'usage_events',
])
export type FeasibilityAdminDomain = z.infer<typeof feasibilityAdminDomainSchema>

export const feasibilityAdminRecordSchema = z.object({
  domain: feasibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FeasibilityAdminRecord = z.infer<typeof feasibilityAdminRecordSchema>

export const feasibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  feasibilityPercent: z.number().min(0).max(100),
})
export type FeasibilityAdminStats = z.infer<typeof feasibilityAdminStatsSchema>

export const feasibilityAdminActionSchema = z.enum(['refresh_feasibility_summary'])
export type FeasibilityAdminAction = z.infer<typeof feasibilityAdminActionSchema>

export const feasibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(feasibilityAdminRecordSchema),
  stats: feasibilityAdminStatsSchema,
  availableActions: z.array(feasibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FeasibilityAdminSummaryResponse = z.infer<
  typeof feasibilityAdminSummaryResponseSchema
>

export const feasibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: feasibilityAdminActionSchema,
})
export type FeasibilityAdminActionRequest = z.infer<
  typeof feasibilityAdminActionRequestSchema
>

export const feasibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: feasibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: feasibilityAdminStatsSchema.optional(),
})
export type FeasibilityAdminActionResponse = z.infer<
  typeof feasibilityAdminActionResponseSchema
>
