import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const chainingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ChainingizabilityAdminDomain = z.infer<typeof chainingizabilityAdminDomainSchema>

export const chainingizabilityAdminRecordSchema = z.object({
  domain: chainingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ChainingizabilityAdminRecord = z.infer<typeof chainingizabilityAdminRecordSchema>

export const chainingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  chainingizabilityPercent: z.number().min(0).max(100),
})
export type ChainingizabilityAdminStats = z.infer<typeof chainingizabilityAdminStatsSchema>

export const chainingizabilityAdminActionSchema = z.enum(['refresh_chainingizability_summary'])
export type ChainingizabilityAdminAction = z.infer<typeof chainingizabilityAdminActionSchema>

export const chainingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(chainingizabilityAdminRecordSchema),
  stats: chainingizabilityAdminStatsSchema,
  availableActions: z.array(chainingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ChainingizabilityAdminSummaryResponse = z.infer<
  typeof chainingizabilityAdminSummaryResponseSchema
>

export const chainingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: chainingizabilityAdminActionSchema,
})
export type ChainingizabilityAdminActionRequest = z.infer<
  typeof chainingizabilityAdminActionRequestSchema
>

export const chainingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: chainingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: chainingizabilityAdminStatsSchema.optional(),
})
export type ChainingizabilityAdminActionResponse = z.infer<
  typeof chainingizabilityAdminActionResponseSchema
>
