import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const remediationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type RemediationizabilityAdminDomain = z.infer<typeof remediationizabilityAdminDomainSchema>

export const remediationizabilityAdminRecordSchema = z.object({
  domain: remediationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RemediationizabilityAdminRecord = z.infer<typeof remediationizabilityAdminRecordSchema>

export const remediationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  remediationizabilityPercent: z.number().min(0).max(100),
})
export type RemediationizabilityAdminStats = z.infer<typeof remediationizabilityAdminStatsSchema>

export const remediationizabilityAdminActionSchema = z.enum(['refresh_remediationizability_summary'])
export type RemediationizabilityAdminAction = z.infer<typeof remediationizabilityAdminActionSchema>

export const remediationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(remediationizabilityAdminRecordSchema),
  stats: remediationizabilityAdminStatsSchema,
  availableActions: z.array(remediationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RemediationizabilityAdminSummaryResponse = z.infer<
  typeof remediationizabilityAdminSummaryResponseSchema
>

export const remediationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: remediationizabilityAdminActionSchema,
})
export type RemediationizabilityAdminActionRequest = z.infer<
  typeof remediationizabilityAdminActionRequestSchema
>

export const remediationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: remediationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: remediationizabilityAdminStatsSchema.optional(),
})
export type RemediationizabilityAdminActionResponse = z.infer<
  typeof remediationizabilityAdminActionResponseSchema
>
