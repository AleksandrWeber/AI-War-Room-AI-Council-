import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const expirationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type ExpirationizabilityAdminDomain = z.infer<typeof expirationizabilityAdminDomainSchema>

export const expirationizabilityAdminRecordSchema = z.object({
  domain: expirationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ExpirationizabilityAdminRecord = z.infer<typeof expirationizabilityAdminRecordSchema>

export const expirationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  expirationizabilityPercent: z.number().min(0).max(100),
})
export type ExpirationizabilityAdminStats = z.infer<typeof expirationizabilityAdminStatsSchema>

export const expirationizabilityAdminActionSchema = z.enum(['refresh_expirationizability_summary'])
export type ExpirationizabilityAdminAction = z.infer<typeof expirationizabilityAdminActionSchema>

export const expirationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(expirationizabilityAdminRecordSchema),
  stats: expirationizabilityAdminStatsSchema,
  availableActions: z.array(expirationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ExpirationizabilityAdminSummaryResponse = z.infer<
  typeof expirationizabilityAdminSummaryResponseSchema
>

export const expirationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: expirationizabilityAdminActionSchema,
})
export type ExpirationizabilityAdminActionRequest = z.infer<
  typeof expirationizabilityAdminActionRequestSchema
>

export const expirationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: expirationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: expirationizabilityAdminStatsSchema.optional(),
})
export type ExpirationizabilityAdminActionResponse = z.infer<
  typeof expirationizabilityAdminActionResponseSchema
>
