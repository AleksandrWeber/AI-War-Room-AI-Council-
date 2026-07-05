import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const evictionizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type EvictionizabilityAdminDomain = z.infer<typeof evictionizabilityAdminDomainSchema>

export const evictionizabilityAdminRecordSchema = z.object({
  domain: evictionizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EvictionizabilityAdminRecord = z.infer<typeof evictionizabilityAdminRecordSchema>

export const evictionizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  evictionizabilityPercent: z.number().min(0).max(100),
})
export type EvictionizabilityAdminStats = z.infer<typeof evictionizabilityAdminStatsSchema>

export const evictionizabilityAdminActionSchema = z.enum(['refresh_evictionizability_summary'])
export type EvictionizabilityAdminAction = z.infer<typeof evictionizabilityAdminActionSchema>

export const evictionizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(evictionizabilityAdminRecordSchema),
  stats: evictionizabilityAdminStatsSchema,
  availableActions: z.array(evictionizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EvictionizabilityAdminSummaryResponse = z.infer<
  typeof evictionizabilityAdminSummaryResponseSchema
>

export const evictionizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: evictionizabilityAdminActionSchema,
})
export type EvictionizabilityAdminActionRequest = z.infer<
  typeof evictionizabilityAdminActionRequestSchema
>

export const evictionizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: evictionizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: evictionizabilityAdminStatsSchema.optional(),
})
export type EvictionizabilityAdminActionResponse = z.infer<
  typeof evictionizabilityAdminActionResponseSchema
>
