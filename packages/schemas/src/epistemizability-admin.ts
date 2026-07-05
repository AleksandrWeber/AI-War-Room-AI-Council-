import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const epistemizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type EpistemizabilityAdminDomain = z.infer<typeof epistemizabilityAdminDomainSchema>

export const epistemizabilityAdminRecordSchema = z.object({
  domain: epistemizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EpistemizabilityAdminRecord = z.infer<typeof epistemizabilityAdminRecordSchema>

export const epistemizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  epistemizabilityPercent: z.number().min(0).max(100),
})
export type EpistemizabilityAdminStats = z.infer<typeof epistemizabilityAdminStatsSchema>

export const epistemizabilityAdminActionSchema = z.enum(['refresh_epistemizability_summary'])
export type EpistemizabilityAdminAction = z.infer<typeof epistemizabilityAdminActionSchema>

export const epistemizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(epistemizabilityAdminRecordSchema),
  stats: epistemizabilityAdminStatsSchema,
  availableActions: z.array(epistemizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EpistemizabilityAdminSummaryResponse = z.infer<
  typeof epistemizabilityAdminSummaryResponseSchema
>

export const epistemizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: epistemizabilityAdminActionSchema,
})
export type EpistemizabilityAdminActionRequest = z.infer<
  typeof epistemizabilityAdminActionRequestSchema
>

export const epistemizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: epistemizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: epistemizabilityAdminStatsSchema.optional(),
})
export type EpistemizabilityAdminActionResponse = z.infer<
  typeof epistemizabilityAdminActionResponseSchema
>
