import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const inductizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type InductizabilityAdminDomain = z.infer<typeof inductizabilityAdminDomainSchema>

export const inductizabilityAdminRecordSchema = z.object({
  domain: inductizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InductizabilityAdminRecord = z.infer<typeof inductizabilityAdminRecordSchema>

export const inductizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  inductizabilityPercent: z.number().min(0).max(100),
})
export type InductizabilityAdminStats = z.infer<typeof inductizabilityAdminStatsSchema>

export const inductizabilityAdminActionSchema = z.enum(['refresh_inductizability_summary'])
export type InductizabilityAdminAction = z.infer<typeof inductizabilityAdminActionSchema>

export const inductizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(inductizabilityAdminRecordSchema),
  stats: inductizabilityAdminStatsSchema,
  availableActions: z.array(inductizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InductizabilityAdminSummaryResponse = z.infer<
  typeof inductizabilityAdminSummaryResponseSchema
>

export const inductizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: inductizabilityAdminActionSchema,
})
export type InductizabilityAdminActionRequest = z.infer<
  typeof inductizabilityAdminActionRequestSchema
>

export const inductizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: inductizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: inductizabilityAdminStatsSchema.optional(),
})
export type InductizabilityAdminActionResponse = z.infer<
  typeof inductizabilityAdminActionResponseSchema
>
