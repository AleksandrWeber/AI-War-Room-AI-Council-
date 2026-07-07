import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const identityizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type IdentityizabilityAdminDomain = z.infer<typeof identityizabilityAdminDomainSchema>

export const identityizabilityAdminRecordSchema = z.object({
  domain: identityizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IdentityizabilityAdminRecord = z.infer<typeof identityizabilityAdminRecordSchema>

export const identityizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  identityizabilityPercent: z.number().min(0).max(100),
})
export type IdentityizabilityAdminStats = z.infer<typeof identityizabilityAdminStatsSchema>

export const identityizabilityAdminActionSchema = z.enum(['refresh_identityizability_summary'])
export type IdentityizabilityAdminAction = z.infer<typeof identityizabilityAdminActionSchema>

export const identityizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(identityizabilityAdminRecordSchema),
  stats: identityizabilityAdminStatsSchema,
  availableActions: z.array(identityizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IdentityizabilityAdminSummaryResponse = z.infer<
  typeof identityizabilityAdminSummaryResponseSchema
>

export const identityizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: identityizabilityAdminActionSchema,
})
export type IdentityizabilityAdminActionRequest = z.infer<
  typeof identityizabilityAdminActionRequestSchema
>

export const identityizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: identityizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: identityizabilityAdminStatsSchema.optional(),
})
export type IdentityizabilityAdminActionResponse = z.infer<
  typeof identityizabilityAdminActionResponseSchema
>
