import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const heuristizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type HeuristizabilityAdminDomain = z.infer<typeof heuristizabilityAdminDomainSchema>

export const heuristizabilityAdminRecordSchema = z.object({
  domain: heuristizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type HeuristizabilityAdminRecord = z.infer<typeof heuristizabilityAdminRecordSchema>

export const heuristizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  heuristizabilityPercent: z.number().min(0).max(100),
})
export type HeuristizabilityAdminStats = z.infer<typeof heuristizabilityAdminStatsSchema>

export const heuristizabilityAdminActionSchema = z.enum(['refresh_heuristizability_summary'])
export type HeuristizabilityAdminAction = z.infer<typeof heuristizabilityAdminActionSchema>

export const heuristizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(heuristizabilityAdminRecordSchema),
  stats: heuristizabilityAdminStatsSchema,
  availableActions: z.array(heuristizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type HeuristizabilityAdminSummaryResponse = z.infer<
  typeof heuristizabilityAdminSummaryResponseSchema
>

export const heuristizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: heuristizabilityAdminActionSchema,
})
export type HeuristizabilityAdminActionRequest = z.infer<
  typeof heuristizabilityAdminActionRequestSchema
>

export const heuristizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: heuristizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: heuristizabilityAdminStatsSchema.optional(),
})
export type HeuristizabilityAdminActionResponse = z.infer<
  typeof heuristizabilityAdminActionResponseSchema
>
