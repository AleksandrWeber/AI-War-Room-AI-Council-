import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const journalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type JournalizabilityAdminDomain = z.infer<typeof journalizabilityAdminDomainSchema>

export const journalizabilityAdminRecordSchema = z.object({
  domain: journalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type JournalizabilityAdminRecord = z.infer<typeof journalizabilityAdminRecordSchema>

export const journalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  journalizabilityPercent: z.number().min(0).max(100),
})
export type JournalizabilityAdminStats = z.infer<typeof journalizabilityAdminStatsSchema>

export const journalizabilityAdminActionSchema = z.enum(['refresh_journalizability_summary'])
export type JournalizabilityAdminAction = z.infer<typeof journalizabilityAdminActionSchema>

export const journalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(journalizabilityAdminRecordSchema),
  stats: journalizabilityAdminStatsSchema,
  availableActions: z.array(journalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type JournalizabilityAdminSummaryResponse = z.infer<
  typeof journalizabilityAdminSummaryResponseSchema
>

export const journalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: journalizabilityAdminActionSchema,
})
export type JournalizabilityAdminActionRequest = z.infer<
  typeof journalizabilityAdminActionRequestSchema
>

export const journalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: journalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: journalizabilityAdminStatsSchema.optional(),
})
export type JournalizabilityAdminActionResponse = z.infer<
  typeof journalizabilityAdminActionResponseSchema
>
