import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const privacyizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type PrivacyizabilityAdminDomain = z.infer<typeof privacyizabilityAdminDomainSchema>

export const privacyizabilityAdminRecordSchema = z.object({
  domain: privacyizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PrivacyizabilityAdminRecord = z.infer<typeof privacyizabilityAdminRecordSchema>

export const privacyizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  privacyizabilityPercent: z.number().min(0).max(100),
})
export type PrivacyizabilityAdminStats = z.infer<typeof privacyizabilityAdminStatsSchema>

export const privacyizabilityAdminActionSchema = z.enum(['refresh_privacyizability_summary'])
export type PrivacyizabilityAdminAction = z.infer<typeof privacyizabilityAdminActionSchema>

export const privacyizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(privacyizabilityAdminRecordSchema),
  stats: privacyizabilityAdminStatsSchema,
  availableActions: z.array(privacyizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PrivacyizabilityAdminSummaryResponse = z.infer<
  typeof privacyizabilityAdminSummaryResponseSchema
>

export const privacyizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: privacyizabilityAdminActionSchema,
})
export type PrivacyizabilityAdminActionRequest = z.infer<
  typeof privacyizabilityAdminActionRequestSchema
>

export const privacyizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: privacyizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: privacyizabilityAdminStatsSchema.optional(),
})
export type PrivacyizabilityAdminActionResponse = z.infer<
  typeof privacyizabilityAdminActionResponseSchema
>
