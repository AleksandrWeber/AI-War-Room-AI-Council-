import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const codifiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type CodifiabilityAdminDomain = z.infer<typeof codifiabilityAdminDomainSchema>

export const codifiabilityAdminRecordSchema = z.object({
  domain: codifiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CodifiabilityAdminRecord = z.infer<typeof codifiabilityAdminRecordSchema>

export const codifiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  codifiabilityPercent: z.number().min(0).max(100),
})
export type CodifiabilityAdminStats = z.infer<typeof codifiabilityAdminStatsSchema>

export const codifiabilityAdminActionSchema = z.enum(['refresh_codifiability_summary'])
export type CodifiabilityAdminAction = z.infer<typeof codifiabilityAdminActionSchema>

export const codifiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(codifiabilityAdminRecordSchema),
  stats: codifiabilityAdminStatsSchema,
  availableActions: z.array(codifiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CodifiabilityAdminSummaryResponse = z.infer<
  typeof codifiabilityAdminSummaryResponseSchema
>

export const codifiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: codifiabilityAdminActionSchema,
})
export type CodifiabilityAdminActionRequest = z.infer<
  typeof codifiabilityAdminActionRequestSchema
>

export const codifiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: codifiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: codifiabilityAdminStatsSchema.optional(),
})
export type CodifiabilityAdminActionResponse = z.infer<
  typeof codifiabilityAdminActionResponseSchema
>
