import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const deployabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type DeployabilizabilityAdminDomain = z.infer<typeof deployabilizabilityAdminDomainSchema>

export const deployabilizabilityAdminRecordSchema = z.object({
  domain: deployabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DeployabilizabilityAdminRecord = z.infer<typeof deployabilizabilityAdminRecordSchema>

export const deployabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  deployabilizabilityPercent: z.number().min(0).max(100),
})
export type DeployabilizabilityAdminStats = z.infer<typeof deployabilizabilityAdminStatsSchema>

export const deployabilizabilityAdminActionSchema = z.enum(['refresh_deployabilizability_summary'])
export type DeployabilizabilityAdminAction = z.infer<typeof deployabilizabilityAdminActionSchema>

export const deployabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(deployabilizabilityAdminRecordSchema),
  stats: deployabilizabilityAdminStatsSchema,
  availableActions: z.array(deployabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DeployabilizabilityAdminSummaryResponse = z.infer<
  typeof deployabilizabilityAdminSummaryResponseSchema
>

export const deployabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deployabilizabilityAdminActionSchema,
})
export type DeployabilizabilityAdminActionRequest = z.infer<
  typeof deployabilizabilityAdminActionRequestSchema
>

export const deployabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deployabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: deployabilizabilityAdminStatsSchema.optional(),
})
export type DeployabilizabilityAdminActionResponse = z.infer<
  typeof deployabilizabilityAdminActionResponseSchema
>
