import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const maintainabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type MaintainabilizabilityAdminDomain = z.infer<typeof maintainabilizabilityAdminDomainSchema>

export const maintainabilizabilityAdminRecordSchema = z.object({
  domain: maintainabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MaintainabilizabilityAdminRecord = z.infer<typeof maintainabilizabilityAdminRecordSchema>

export const maintainabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  maintainabilizabilityPercent: z.number().min(0).max(100),
})
export type MaintainabilizabilityAdminStats = z.infer<typeof maintainabilizabilityAdminStatsSchema>

export const maintainabilizabilityAdminActionSchema = z.enum(['refresh_maintainabilizability_summary'])
export type MaintainabilizabilityAdminAction = z.infer<typeof maintainabilizabilityAdminActionSchema>

export const maintainabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(maintainabilizabilityAdminRecordSchema),
  stats: maintainabilizabilityAdminStatsSchema,
  availableActions: z.array(maintainabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MaintainabilizabilityAdminSummaryResponse = z.infer<
  typeof maintainabilizabilityAdminSummaryResponseSchema
>

export const maintainabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: maintainabilizabilityAdminActionSchema,
})
export type MaintainabilizabilityAdminActionRequest = z.infer<
  typeof maintainabilizabilityAdminActionRequestSchema
>

export const maintainabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: maintainabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: maintainabilizabilityAdminStatsSchema.optional(),
})
export type MaintainabilizabilityAdminActionResponse = z.infer<
  typeof maintainabilizabilityAdminActionResponseSchema
>
