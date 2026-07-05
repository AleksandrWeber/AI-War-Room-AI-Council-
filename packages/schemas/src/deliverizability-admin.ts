import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const deliverizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type DeliverizabilityAdminDomain = z.infer<typeof deliverizabilityAdminDomainSchema>

export const deliverizabilityAdminRecordSchema = z.object({
  domain: deliverizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DeliverizabilityAdminRecord = z.infer<typeof deliverizabilityAdminRecordSchema>

export const deliverizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  deliverizabilityPercent: z.number().min(0).max(100),
})
export type DeliverizabilityAdminStats = z.infer<typeof deliverizabilityAdminStatsSchema>

export const deliverizabilityAdminActionSchema = z.enum(['refresh_deliverizability_summary'])
export type DeliverizabilityAdminAction = z.infer<typeof deliverizabilityAdminActionSchema>

export const deliverizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(deliverizabilityAdminRecordSchema),
  stats: deliverizabilityAdminStatsSchema,
  availableActions: z.array(deliverizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DeliverizabilityAdminSummaryResponse = z.infer<
  typeof deliverizabilityAdminSummaryResponseSchema
>

export const deliverizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deliverizabilityAdminActionSchema,
})
export type DeliverizabilityAdminActionRequest = z.infer<
  typeof deliverizabilityAdminActionRequestSchema
>

export const deliverizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: deliverizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: deliverizabilityAdminStatsSchema.optional(),
})
export type DeliverizabilityAdminActionResponse = z.infer<
  typeof deliverizabilityAdminActionResponseSchema
>
