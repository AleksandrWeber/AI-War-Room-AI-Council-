import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const compactizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type CompactizabilityAdminDomain = z.infer<typeof compactizabilityAdminDomainSchema>

export const compactizabilityAdminRecordSchema = z.object({
  domain: compactizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CompactizabilityAdminRecord = z.infer<typeof compactizabilityAdminRecordSchema>

export const compactizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  compactizabilityPercent: z.number().min(0).max(100),
})
export type CompactizabilityAdminStats = z.infer<typeof compactizabilityAdminStatsSchema>

export const compactizabilityAdminActionSchema = z.enum(['refresh_compactizability_summary'])
export type CompactizabilityAdminAction = z.infer<typeof compactizabilityAdminActionSchema>

export const compactizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(compactizabilityAdminRecordSchema),
  stats: compactizabilityAdminStatsSchema,
  availableActions: z.array(compactizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CompactizabilityAdminSummaryResponse = z.infer<
  typeof compactizabilityAdminSummaryResponseSchema
>

export const compactizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compactizabilityAdminActionSchema,
})
export type CompactizabilityAdminActionRequest = z.infer<
  typeof compactizabilityAdminActionRequestSchema
>

export const compactizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compactizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: compactizabilityAdminStatsSchema.optional(),
})
export type CompactizabilityAdminActionResponse = z.infer<
  typeof compactizabilityAdminActionResponseSchema
>
