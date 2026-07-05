import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const narratabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type NarratabilityAdminDomain = z.infer<typeof narratabilityAdminDomainSchema>

export const narratabilityAdminRecordSchema = z.object({
  domain: narratabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NarratabilityAdminRecord = z.infer<typeof narratabilityAdminRecordSchema>

export const narratabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  narratabilityPercent: z.number().min(0).max(100),
})
export type NarratabilityAdminStats = z.infer<typeof narratabilityAdminStatsSchema>

export const narratabilityAdminActionSchema = z.enum(['refresh_narratability_summary'])
export type NarratabilityAdminAction = z.infer<typeof narratabilityAdminActionSchema>

export const narratabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(narratabilityAdminRecordSchema),
  stats: narratabilityAdminStatsSchema,
  availableActions: z.array(narratabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NarratabilityAdminSummaryResponse = z.infer<
  typeof narratabilityAdminSummaryResponseSchema
>

export const narratabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: narratabilityAdminActionSchema,
})
export type NarratabilityAdminActionRequest = z.infer<
  typeof narratabilityAdminActionRequestSchema
>

export const narratabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: narratabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: narratabilityAdminStatsSchema.optional(),
})
export type NarratabilityAdminActionResponse = z.infer<
  typeof narratabilityAdminActionResponseSchema
>
