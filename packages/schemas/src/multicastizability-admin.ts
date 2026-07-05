import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const multicastizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type MulticastizabilityAdminDomain = z.infer<typeof multicastizabilityAdminDomainSchema>

export const multicastizabilityAdminRecordSchema = z.object({
  domain: multicastizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MulticastizabilityAdminRecord = z.infer<typeof multicastizabilityAdminRecordSchema>

export const multicastizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  multicastizabilityPercent: z.number().min(0).max(100),
})
export type MulticastizabilityAdminStats = z.infer<typeof multicastizabilityAdminStatsSchema>

export const multicastizabilityAdminActionSchema = z.enum(['refresh_multicastizability_summary'])
export type MulticastizabilityAdminAction = z.infer<typeof multicastizabilityAdminActionSchema>

export const multicastizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(multicastizabilityAdminRecordSchema),
  stats: multicastizabilityAdminStatsSchema,
  availableActions: z.array(multicastizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MulticastizabilityAdminSummaryResponse = z.infer<
  typeof multicastizabilityAdminSummaryResponseSchema
>

export const multicastizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: multicastizabilityAdminActionSchema,
})
export type MulticastizabilityAdminActionRequest = z.infer<
  typeof multicastizabilityAdminActionRequestSchema
>

export const multicastizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: multicastizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: multicastizabilityAdminStatsSchema.optional(),
})
export type MulticastizabilityAdminActionResponse = z.infer<
  typeof multicastizabilityAdminActionResponseSchema
>
