import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const brokerizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type BrokerizabilityAdminDomain = z.infer<typeof brokerizabilityAdminDomainSchema>

export const brokerizabilityAdminRecordSchema = z.object({
  domain: brokerizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BrokerizabilityAdminRecord = z.infer<typeof brokerizabilityAdminRecordSchema>

export const brokerizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  brokerizabilityPercent: z.number().min(0).max(100),
})
export type BrokerizabilityAdminStats = z.infer<typeof brokerizabilityAdminStatsSchema>

export const brokerizabilityAdminActionSchema = z.enum(['refresh_brokerizability_summary'])
export type BrokerizabilityAdminAction = z.infer<typeof brokerizabilityAdminActionSchema>

export const brokerizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(brokerizabilityAdminRecordSchema),
  stats: brokerizabilityAdminStatsSchema,
  availableActions: z.array(brokerizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BrokerizabilityAdminSummaryResponse = z.infer<
  typeof brokerizabilityAdminSummaryResponseSchema
>

export const brokerizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: brokerizabilityAdminActionSchema,
})
export type BrokerizabilityAdminActionRequest = z.infer<
  typeof brokerizabilityAdminActionRequestSchema
>

export const brokerizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: brokerizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: brokerizabilityAdminStatsSchema.optional(),
})
export type BrokerizabilityAdminActionResponse = z.infer<
  typeof brokerizabilityAdminActionResponseSchema
>
