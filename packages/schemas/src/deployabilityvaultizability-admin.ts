import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const deployabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type DeployabilityvaultizabilityAdminDomain = z.infer<typeof deployabilityvaultizabilityAdminDomainSchema>

export const deployabilityvaultizabilityAdminRecordSchema = z.object({
  domain: deployabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DeployabilityvaultizabilityAdminRecord = z.infer<typeof deployabilityvaultizabilityAdminRecordSchema>

export const deployabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  deployabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type DeployabilityvaultizabilityAdminStats = z.infer<typeof deployabilityvaultizabilityAdminStatsSchema>

export const deployabilityvaultizabilityAdminActionSchema = z.enum(['refresh_deployabilityvaultizability_summary'])
export type DeployabilityvaultizabilityAdminAction = z.infer<typeof deployabilityvaultizabilityAdminActionSchema>

export const deployabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(deployabilityvaultizabilityAdminRecordSchema),
  stats: deployabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(deployabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DeployabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof deployabilityvaultizabilityAdminSummaryResponseSchema
>

export const deployabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deployabilityvaultizabilityAdminActionSchema,
})
export type DeployabilityvaultizabilityAdminActionRequest = z.infer<
  typeof deployabilityvaultizabilityAdminActionRequestSchema
>

export const deployabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deployabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: deployabilityvaultizabilityAdminStatsSchema.optional(),
})
export type DeployabilityvaultizabilityAdminActionResponse = z.infer<
  typeof deployabilityvaultizabilityAdminActionResponseSchema
>
