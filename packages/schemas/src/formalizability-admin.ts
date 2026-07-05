import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const formalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type FormalizabilityAdminDomain = z.infer<typeof formalizabilityAdminDomainSchema>

export const formalizabilityAdminRecordSchema = z.object({
  domain: formalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FormalizabilityAdminRecord = z.infer<typeof formalizabilityAdminRecordSchema>

export const formalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  formalizabilityPercent: z.number().min(0).max(100),
})
export type FormalizabilityAdminStats = z.infer<typeof formalizabilityAdminStatsSchema>

export const formalizabilityAdminActionSchema = z.enum(['refresh_formalizability_summary'])
export type FormalizabilityAdminAction = z.infer<typeof formalizabilityAdminActionSchema>

export const formalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(formalizabilityAdminRecordSchema),
  stats: formalizabilityAdminStatsSchema,
  availableActions: z.array(formalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FormalizabilityAdminSummaryResponse = z.infer<
  typeof formalizabilityAdminSummaryResponseSchema
>

export const formalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: formalizabilityAdminActionSchema,
})
export type FormalizabilityAdminActionRequest = z.infer<
  typeof formalizabilityAdminActionRequestSchema
>

export const formalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: formalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: formalizabilityAdminStatsSchema.optional(),
})
export type FormalizabilityAdminActionResponse = z.infer<
  typeof formalizabilityAdminActionResponseSchema
>
