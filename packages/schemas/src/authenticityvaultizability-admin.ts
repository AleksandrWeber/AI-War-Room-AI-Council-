import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const authenticityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type AuthenticityvaultizabilityAdminDomain = z.infer<typeof authenticityvaultizabilityAdminDomainSchema>

export const authenticityvaultizabilityAdminRecordSchema = z.object({
  domain: authenticityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuthenticityvaultizabilityAdminRecord = z.infer<typeof authenticityvaultizabilityAdminRecordSchema>

export const authenticityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  authenticityvaultizabilityPercent: z.number().min(0).max(100),
})
export type AuthenticityvaultizabilityAdminStats = z.infer<typeof authenticityvaultizabilityAdminStatsSchema>

export const authenticityvaultizabilityAdminActionSchema = z.enum(['refresh_authenticityvaultizability_summary'])
export type AuthenticityvaultizabilityAdminAction = z.infer<typeof authenticityvaultizabilityAdminActionSchema>

export const authenticityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(authenticityvaultizabilityAdminRecordSchema),
  stats: authenticityvaultizabilityAdminStatsSchema,
  availableActions: z.array(authenticityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuthenticityvaultizabilityAdminSummaryResponse = z.infer<
  typeof authenticityvaultizabilityAdminSummaryResponseSchema
>

export const authenticityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: authenticityvaultizabilityAdminActionSchema,
})
export type AuthenticityvaultizabilityAdminActionRequest = z.infer<
  typeof authenticityvaultizabilityAdminActionRequestSchema
>

export const authenticityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: authenticityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: authenticityvaultizabilityAdminStatsSchema.optional(),
})
export type AuthenticityvaultizabilityAdminActionResponse = z.infer<
  typeof authenticityvaultizabilityAdminActionResponseSchema
>
