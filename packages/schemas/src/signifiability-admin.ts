import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const signifiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type SignifiabilityAdminDomain = z.infer<typeof signifiabilityAdminDomainSchema>

export const signifiabilityAdminRecordSchema = z.object({
  domain: signifiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SignifiabilityAdminRecord = z.infer<typeof signifiabilityAdminRecordSchema>

export const signifiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  signifiabilityPercent: z.number().min(0).max(100),
})
export type SignifiabilityAdminStats = z.infer<typeof signifiabilityAdminStatsSchema>

export const signifiabilityAdminActionSchema = z.enum(['refresh_signifiability_summary'])
export type SignifiabilityAdminAction = z.infer<typeof signifiabilityAdminActionSchema>

export const signifiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(signifiabilityAdminRecordSchema),
  stats: signifiabilityAdminStatsSchema,
  availableActions: z.array(signifiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SignifiabilityAdminSummaryResponse = z.infer<
  typeof signifiabilityAdminSummaryResponseSchema
>

export const signifiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: signifiabilityAdminActionSchema,
})
export type SignifiabilityAdminActionRequest = z.infer<
  typeof signifiabilityAdminActionRequestSchema
>

export const signifiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: signifiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: signifiabilityAdminStatsSchema.optional(),
})
export type SignifiabilityAdminActionResponse = z.infer<
  typeof signifiabilityAdminActionResponseSchema
>
