import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const permissionizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type PermissionizabilityAdminDomain = z.infer<typeof permissionizabilityAdminDomainSchema>

export const permissionizabilityAdminRecordSchema = z.object({
  domain: permissionizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PermissionizabilityAdminRecord = z.infer<typeof permissionizabilityAdminRecordSchema>

export const permissionizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  permissionizabilityPercent: z.number().min(0).max(100),
})
export type PermissionizabilityAdminStats = z.infer<typeof permissionizabilityAdminStatsSchema>

export const permissionizabilityAdminActionSchema = z.enum(['refresh_permissionizability_summary'])
export type PermissionizabilityAdminAction = z.infer<typeof permissionizabilityAdminActionSchema>

export const permissionizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(permissionizabilityAdminRecordSchema),
  stats: permissionizabilityAdminStatsSchema,
  availableActions: z.array(permissionizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PermissionizabilityAdminSummaryResponse = z.infer<
  typeof permissionizabilityAdminSummaryResponseSchema
>

export const permissionizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: permissionizabilityAdminActionSchema,
})
export type PermissionizabilityAdminActionRequest = z.infer<
  typeof permissionizabilityAdminActionRequestSchema
>

export const permissionizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: permissionizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: permissionizabilityAdminStatsSchema.optional(),
})
export type PermissionizabilityAdminActionResponse = z.infer<
  typeof permissionizabilityAdminActionResponseSchema
>
