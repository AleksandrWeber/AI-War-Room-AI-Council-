import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const deployabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'usage_events',
])
export type DeployabilityAdminDomain = z.infer<typeof deployabilityAdminDomainSchema>

export const deployabilityAdminRecordSchema = z.object({
  domain: deployabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DeployabilityAdminRecord = z.infer<typeof deployabilityAdminRecordSchema>

export const deployabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  deployabilityPercent: z.number().min(0).max(100),
})
export type DeployabilityAdminStats = z.infer<typeof deployabilityAdminStatsSchema>

export const deployabilityAdminActionSchema = z.enum(['refresh_deployability_summary'])
export type DeployabilityAdminAction = z.infer<typeof deployabilityAdminActionSchema>

export const deployabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(deployabilityAdminRecordSchema),
  stats: deployabilityAdminStatsSchema,
  availableActions: z.array(deployabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DeployabilityAdminSummaryResponse = z.infer<
  typeof deployabilityAdminSummaryResponseSchema
>

export const deployabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deployabilityAdminActionSchema,
})
export type DeployabilityAdminActionRequest = z.infer<
  typeof deployabilityAdminActionRequestSchema
>

export const deployabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deployabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: deployabilityAdminStatsSchema.optional(),
})
export type DeployabilityAdminActionResponse = z.infer<
  typeof deployabilityAdminActionResponseSchema
>
