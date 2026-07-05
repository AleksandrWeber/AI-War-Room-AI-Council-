import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const aggregatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type AggregatizabilityAdminDomain = z.infer<typeof aggregatizabilityAdminDomainSchema>

export const aggregatizabilityAdminRecordSchema = z.object({
  domain: aggregatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AggregatizabilityAdminRecord = z.infer<typeof aggregatizabilityAdminRecordSchema>

export const aggregatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  aggregatizabilityPercent: z.number().min(0).max(100),
})
export type AggregatizabilityAdminStats = z.infer<typeof aggregatizabilityAdminStatsSchema>

export const aggregatizabilityAdminActionSchema = z.enum(['refresh_aggregatizability_summary'])
export type AggregatizabilityAdminAction = z.infer<typeof aggregatizabilityAdminActionSchema>

export const aggregatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(aggregatizabilityAdminRecordSchema),
  stats: aggregatizabilityAdminStatsSchema,
  availableActions: z.array(aggregatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AggregatizabilityAdminSummaryResponse = z.infer<
  typeof aggregatizabilityAdminSummaryResponseSchema
>

export const aggregatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: aggregatizabilityAdminActionSchema,
})
export type AggregatizabilityAdminActionRequest = z.infer<
  typeof aggregatizabilityAdminActionRequestSchema
>

export const aggregatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: aggregatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: aggregatizabilityAdminStatsSchema.optional(),
})
export type AggregatizabilityAdminActionResponse = z.infer<
  typeof aggregatizabilityAdminActionResponseSchema
>
