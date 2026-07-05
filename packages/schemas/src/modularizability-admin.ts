import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const modularizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type ModularizabilityAdminDomain = z.infer<typeof modularizabilityAdminDomainSchema>

export const modularizabilityAdminRecordSchema = z.object({
  domain: modularizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ModularizabilityAdminRecord = z.infer<typeof modularizabilityAdminRecordSchema>

export const modularizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  modularizabilityPercent: z.number().min(0).max(100),
})
export type ModularizabilityAdminStats = z.infer<typeof modularizabilityAdminStatsSchema>

export const modularizabilityAdminActionSchema = z.enum(['refresh_modularizability_summary'])
export type ModularizabilityAdminAction = z.infer<typeof modularizabilityAdminActionSchema>

export const modularizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(modularizabilityAdminRecordSchema),
  stats: modularizabilityAdminStatsSchema,
  availableActions: z.array(modularizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ModularizabilityAdminSummaryResponse = z.infer<
  typeof modularizabilityAdminSummaryResponseSchema
>

export const modularizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: modularizabilityAdminActionSchema,
})
export type ModularizabilityAdminActionRequest = z.infer<
  typeof modularizabilityAdminActionRequestSchema
>

export const modularizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: modularizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: modularizabilityAdminStatsSchema.optional(),
})
export type ModularizabilityAdminActionResponse = z.infer<
  typeof modularizabilityAdminActionResponseSchema
>
