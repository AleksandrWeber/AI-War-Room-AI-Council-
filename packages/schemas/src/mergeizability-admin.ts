import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const mergeizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type MergeizabilityAdminDomain = z.infer<typeof mergeizabilityAdminDomainSchema>

export const mergeizabilityAdminRecordSchema = z.object({
  domain: mergeizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MergeizabilityAdminRecord = z.infer<typeof mergeizabilityAdminRecordSchema>

export const mergeizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  mergeizabilityPercent: z.number().min(0).max(100),
})
export type MergeizabilityAdminStats = z.infer<typeof mergeizabilityAdminStatsSchema>

export const mergeizabilityAdminActionSchema = z.enum(['refresh_mergeizability_summary'])
export type MergeizabilityAdminAction = z.infer<typeof mergeizabilityAdminActionSchema>

export const mergeizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(mergeizabilityAdminRecordSchema),
  stats: mergeizabilityAdminStatsSchema,
  availableActions: z.array(mergeizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MergeizabilityAdminSummaryResponse = z.infer<
  typeof mergeizabilityAdminSummaryResponseSchema
>

export const mergeizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: mergeizabilityAdminActionSchema,
})
export type MergeizabilityAdminActionRequest = z.infer<
  typeof mergeizabilityAdminActionRequestSchema
>

export const mergeizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: mergeizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: mergeizabilityAdminStatsSchema.optional(),
})
export type MergeizabilityAdminActionResponse = z.infer<
  typeof mergeizabilityAdminActionResponseSchema
>
