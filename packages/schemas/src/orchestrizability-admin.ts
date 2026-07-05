import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const orchestrizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type OrchestrizabilityAdminDomain = z.infer<typeof orchestrizabilityAdminDomainSchema>

export const orchestrizabilityAdminRecordSchema = z.object({
  domain: orchestrizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OrchestrizabilityAdminRecord = z.infer<typeof orchestrizabilityAdminRecordSchema>

export const orchestrizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  orchestrizabilityPercent: z.number().min(0).max(100),
})
export type OrchestrizabilityAdminStats = z.infer<typeof orchestrizabilityAdminStatsSchema>

export const orchestrizabilityAdminActionSchema = z.enum(['refresh_orchestrizability_summary'])
export type OrchestrizabilityAdminAction = z.infer<typeof orchestrizabilityAdminActionSchema>

export const orchestrizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(orchestrizabilityAdminRecordSchema),
  stats: orchestrizabilityAdminStatsSchema,
  availableActions: z.array(orchestrizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OrchestrizabilityAdminSummaryResponse = z.infer<
  typeof orchestrizabilityAdminSummaryResponseSchema
>

export const orchestrizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: orchestrizabilityAdminActionSchema,
})
export type OrchestrizabilityAdminActionRequest = z.infer<
  typeof orchestrizabilityAdminActionRequestSchema
>

export const orchestrizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: orchestrizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: orchestrizabilityAdminStatsSchema.optional(),
})
export type OrchestrizabilityAdminActionResponse = z.infer<
  typeof orchestrizabilityAdminActionResponseSchema
>
