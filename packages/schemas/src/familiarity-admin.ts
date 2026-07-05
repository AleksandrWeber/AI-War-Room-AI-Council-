import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const familiarityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type FamiliarityAdminDomain = z.infer<typeof familiarityAdminDomainSchema>

export const familiarityAdminRecordSchema = z.object({
  domain: familiarityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FamiliarityAdminRecord = z.infer<typeof familiarityAdminRecordSchema>

export const familiarityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  familiarityPercent: z.number().min(0).max(100),
})
export type FamiliarityAdminStats = z.infer<typeof familiarityAdminStatsSchema>

export const familiarityAdminActionSchema = z.enum(['refresh_familiarity_summary'])
export type FamiliarityAdminAction = z.infer<typeof familiarityAdminActionSchema>

export const familiarityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(familiarityAdminRecordSchema),
  stats: familiarityAdminStatsSchema,
  availableActions: z.array(familiarityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FamiliarityAdminSummaryResponse = z.infer<
  typeof familiarityAdminSummaryResponseSchema
>

export const familiarityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: familiarityAdminActionSchema,
})
export type FamiliarityAdminActionRequest = z.infer<
  typeof familiarityAdminActionRequestSchema
>

export const familiarityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: familiarityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: familiarityAdminStatsSchema.optional(),
})
export type FamiliarityAdminActionResponse = z.infer<
  typeof familiarityAdminActionResponseSchema
>
