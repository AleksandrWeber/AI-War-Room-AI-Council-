import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const leastprivilegeizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type LeastprivilegeizabilityAdminDomain = z.infer<typeof leastprivilegeizabilityAdminDomainSchema>

export const leastprivilegeizabilityAdminRecordSchema = z.object({
  domain: leastprivilegeizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type LeastprivilegeizabilityAdminRecord = z.infer<typeof leastprivilegeizabilityAdminRecordSchema>

export const leastprivilegeizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  leastprivilegeizabilityPercent: z.number().min(0).max(100),
})
export type LeastprivilegeizabilityAdminStats = z.infer<typeof leastprivilegeizabilityAdminStatsSchema>

export const leastprivilegeizabilityAdminActionSchema = z.enum(['refresh_leastprivilegeizability_summary'])
export type LeastprivilegeizabilityAdminAction = z.infer<typeof leastprivilegeizabilityAdminActionSchema>

export const leastprivilegeizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(leastprivilegeizabilityAdminRecordSchema),
  stats: leastprivilegeizabilityAdminStatsSchema,
  availableActions: z.array(leastprivilegeizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type LeastprivilegeizabilityAdminSummaryResponse = z.infer<
  typeof leastprivilegeizabilityAdminSummaryResponseSchema
>

export const leastprivilegeizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: leastprivilegeizabilityAdminActionSchema,
})
export type LeastprivilegeizabilityAdminActionRequest = z.infer<
  typeof leastprivilegeizabilityAdminActionRequestSchema
>

export const leastprivilegeizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: leastprivilegeizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: leastprivilegeizabilityAdminStatsSchema.optional(),
})
export type LeastprivilegeizabilityAdminActionResponse = z.infer<
  typeof leastprivilegeizabilityAdminActionResponseSchema
>
