import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const hydrationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type HydrationizabilityAdminDomain = z.infer<typeof hydrationizabilityAdminDomainSchema>

export const hydrationizabilityAdminRecordSchema = z.object({
  domain: hydrationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type HydrationizabilityAdminRecord = z.infer<typeof hydrationizabilityAdminRecordSchema>

export const hydrationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  hydrationizabilityPercent: z.number().min(0).max(100),
})
export type HydrationizabilityAdminStats = z.infer<typeof hydrationizabilityAdminStatsSchema>

export const hydrationizabilityAdminActionSchema = z.enum(['refresh_hydrationizability_summary'])
export type HydrationizabilityAdminAction = z.infer<typeof hydrationizabilityAdminActionSchema>

export const hydrationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(hydrationizabilityAdminRecordSchema),
  stats: hydrationizabilityAdminStatsSchema,
  availableActions: z.array(hydrationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type HydrationizabilityAdminSummaryResponse = z.infer<
  typeof hydrationizabilityAdminSummaryResponseSchema
>

export const hydrationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: hydrationizabilityAdminActionSchema,
})
export type HydrationizabilityAdminActionRequest = z.infer<
  typeof hydrationizabilityAdminActionRequestSchema
>

export const hydrationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: hydrationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: hydrationizabilityAdminStatsSchema.optional(),
})
export type HydrationizabilityAdminActionResponse = z.infer<
  typeof hydrationizabilityAdminActionResponseSchema
>
