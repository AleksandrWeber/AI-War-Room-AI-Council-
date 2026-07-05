import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const determinizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type DeterminizabilityAdminDomain = z.infer<typeof determinizabilityAdminDomainSchema>

export const determinizabilityAdminRecordSchema = z.object({
  domain: determinizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DeterminizabilityAdminRecord = z.infer<typeof determinizabilityAdminRecordSchema>

export const determinizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  determinizabilityPercent: z.number().min(0).max(100),
})
export type DeterminizabilityAdminStats = z.infer<typeof determinizabilityAdminStatsSchema>

export const determinizabilityAdminActionSchema = z.enum(['refresh_determinizability_summary'])
export type DeterminizabilityAdminAction = z.infer<typeof determinizabilityAdminActionSchema>

export const determinizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(determinizabilityAdminRecordSchema),
  stats: determinizabilityAdminStatsSchema,
  availableActions: z.array(determinizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DeterminizabilityAdminSummaryResponse = z.infer<
  typeof determinizabilityAdminSummaryResponseSchema
>

export const determinizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: determinizabilityAdminActionSchema,
})
export type DeterminizabilityAdminActionRequest = z.infer<
  typeof determinizabilityAdminActionRequestSchema
>

export const determinizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: determinizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: determinizabilityAdminStatsSchema.optional(),
})
export type DeterminizabilityAdminActionResponse = z.infer<
  typeof determinizabilityAdminActionResponseSchema
>
