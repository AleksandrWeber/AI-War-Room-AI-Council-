import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const followerizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type FollowerizabilityAdminDomain = z.infer<typeof followerizabilityAdminDomainSchema>

export const followerizabilityAdminRecordSchema = z.object({
  domain: followerizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FollowerizabilityAdminRecord = z.infer<typeof followerizabilityAdminRecordSchema>

export const followerizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  followerizabilityPercent: z.number().min(0).max(100),
})
export type FollowerizabilityAdminStats = z.infer<typeof followerizabilityAdminStatsSchema>

export const followerizabilityAdminActionSchema = z.enum(['refresh_followerizability_summary'])
export type FollowerizabilityAdminAction = z.infer<typeof followerizabilityAdminActionSchema>

export const followerizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(followerizabilityAdminRecordSchema),
  stats: followerizabilityAdminStatsSchema,
  availableActions: z.array(followerizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FollowerizabilityAdminSummaryResponse = z.infer<
  typeof followerizabilityAdminSummaryResponseSchema
>

export const followerizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: followerizabilityAdminActionSchema,
})
export type FollowerizabilityAdminActionRequest = z.infer<
  typeof followerizabilityAdminActionRequestSchema
>

export const followerizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: followerizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: followerizabilityAdminStatsSchema.optional(),
})
export type FollowerizabilityAdminActionResponse = z.infer<
  typeof followerizabilityAdminActionResponseSchema
>
