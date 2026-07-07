import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const allocationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type AllocationizabilityAdminDomain = z.infer<typeof allocationizabilityAdminDomainSchema>

export const allocationizabilityAdminRecordSchema = z.object({
  domain: allocationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AllocationizabilityAdminRecord = z.infer<typeof allocationizabilityAdminRecordSchema>

export const allocationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  allocationizabilityPercent: z.number().min(0).max(100),
})
export type AllocationizabilityAdminStats = z.infer<typeof allocationizabilityAdminStatsSchema>

export const allocationizabilityAdminActionSchema = z.enum(['refresh_allocationizability_summary'])
export type AllocationizabilityAdminAction = z.infer<typeof allocationizabilityAdminActionSchema>

export const allocationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(allocationizabilityAdminRecordSchema),
  stats: allocationizabilityAdminStatsSchema,
  availableActions: z.array(allocationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AllocationizabilityAdminSummaryResponse = z.infer<
  typeof allocationizabilityAdminSummaryResponseSchema
>

export const allocationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: allocationizabilityAdminActionSchema,
})
export type AllocationizabilityAdminActionRequest = z.infer<
  typeof allocationizabilityAdminActionRequestSchema
>

export const allocationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: allocationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: allocationizabilityAdminStatsSchema.optional(),
})
export type AllocationizabilityAdminActionResponse = z.infer<
  typeof allocationizabilityAdminActionResponseSchema
>
