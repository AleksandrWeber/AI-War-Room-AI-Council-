import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const stabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type StabilizabilityAdminDomain = z.infer<typeof stabilizabilityAdminDomainSchema>

export const stabilizabilityAdminRecordSchema = z.object({
  domain: stabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type StabilizabilityAdminRecord = z.infer<typeof stabilizabilityAdminRecordSchema>

export const stabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  stabilizabilityPercent: z.number().min(0).max(100),
})
export type StabilizabilityAdminStats = z.infer<typeof stabilizabilityAdminStatsSchema>

export const stabilizabilityAdminActionSchema = z.enum(['refresh_stabilizability_summary'])
export type StabilizabilityAdminAction = z.infer<typeof stabilizabilityAdminActionSchema>

export const stabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(stabilizabilityAdminRecordSchema),
  stats: stabilizabilityAdminStatsSchema,
  availableActions: z.array(stabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type StabilizabilityAdminSummaryResponse = z.infer<
  typeof stabilizabilityAdminSummaryResponseSchema
>

export const stabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: stabilizabilityAdminActionSchema,
})
export type StabilizabilityAdminActionRequest = z.infer<
  typeof stabilizabilityAdminActionRequestSchema
>

export const stabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: stabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: stabilizabilityAdminStatsSchema.optional(),
})
export type StabilizabilityAdminActionResponse = z.infer<
  typeof stabilizabilityAdminActionResponseSchema
>
