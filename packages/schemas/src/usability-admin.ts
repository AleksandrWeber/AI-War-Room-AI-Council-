import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const usabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type UsabilityAdminDomain = z.infer<typeof usabilityAdminDomainSchema>

export const usabilityAdminRecordSchema = z.object({
  domain: usabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type UsabilityAdminRecord = z.infer<typeof usabilityAdminRecordSchema>

export const usabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  usabilityPercent: z.number().min(0).max(100),
})
export type UsabilityAdminStats = z.infer<typeof usabilityAdminStatsSchema>

export const usabilityAdminActionSchema = z.enum(['refresh_usability_summary'])
export type UsabilityAdminAction = z.infer<typeof usabilityAdminActionSchema>

export const usabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(usabilityAdminRecordSchema),
  stats: usabilityAdminStatsSchema,
  availableActions: z.array(usabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type UsabilityAdminSummaryResponse = z.infer<
  typeof usabilityAdminSummaryResponseSchema
>

export const usabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: usabilityAdminActionSchema,
})
export type UsabilityAdminActionRequest = z.infer<
  typeof usabilityAdminActionRequestSchema
>

export const usabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: usabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: usabilityAdminStatsSchema.optional(),
})
export type UsabilityAdminActionResponse = z.infer<
  typeof usabilityAdminActionResponseSchema
>
