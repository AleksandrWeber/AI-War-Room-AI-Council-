import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const keymanagementizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type KeymanagementizabilityAdminDomain = z.infer<typeof keymanagementizabilityAdminDomainSchema>

export const keymanagementizabilityAdminRecordSchema = z.object({
  domain: keymanagementizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type KeymanagementizabilityAdminRecord = z.infer<typeof keymanagementizabilityAdminRecordSchema>

export const keymanagementizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  keymanagementizabilityPercent: z.number().min(0).max(100),
})
export type KeymanagementizabilityAdminStats = z.infer<typeof keymanagementizabilityAdminStatsSchema>

export const keymanagementizabilityAdminActionSchema = z.enum(['refresh_keymanagementizability_summary'])
export type KeymanagementizabilityAdminAction = z.infer<typeof keymanagementizabilityAdminActionSchema>

export const keymanagementizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(keymanagementizabilityAdminRecordSchema),
  stats: keymanagementizabilityAdminStatsSchema,
  availableActions: z.array(keymanagementizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type KeymanagementizabilityAdminSummaryResponse = z.infer<
  typeof keymanagementizabilityAdminSummaryResponseSchema
>

export const keymanagementizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: keymanagementizabilityAdminActionSchema,
})
export type KeymanagementizabilityAdminActionRequest = z.infer<
  typeof keymanagementizabilityAdminActionRequestSchema
>

export const keymanagementizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: keymanagementizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: keymanagementizabilityAdminStatsSchema.optional(),
})
export type KeymanagementizabilityAdminActionResponse = z.infer<
  typeof keymanagementizabilityAdminActionResponseSchema
>
