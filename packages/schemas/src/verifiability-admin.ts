import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const verifiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_webhook_events',
])
export type VerifiabilityAdminDomain = z.infer<typeof verifiabilityAdminDomainSchema>

export const verifiabilityAdminRecordSchema = z.object({
  domain: verifiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type VerifiabilityAdminRecord = z.infer<typeof verifiabilityAdminRecordSchema>

export const verifiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  verifiabilityPercent: z.number().min(0).max(100),
})
export type VerifiabilityAdminStats = z.infer<typeof verifiabilityAdminStatsSchema>

export const verifiabilityAdminActionSchema = z.enum(['refresh_verifiability_summary'])
export type VerifiabilityAdminAction = z.infer<typeof verifiabilityAdminActionSchema>

export const verifiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(verifiabilityAdminRecordSchema),
  stats: verifiabilityAdminStatsSchema,
  availableActions: z.array(verifiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type VerifiabilityAdminSummaryResponse = z.infer<
  typeof verifiabilityAdminSummaryResponseSchema
>

export const verifiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: verifiabilityAdminActionSchema,
})
export type VerifiabilityAdminActionRequest = z.infer<
  typeof verifiabilityAdminActionRequestSchema
>

export const verifiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: verifiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: verifiabilityAdminStatsSchema.optional(),
})
export type VerifiabilityAdminActionResponse = z.infer<
  typeof verifiabilityAdminActionResponseSchema
>
