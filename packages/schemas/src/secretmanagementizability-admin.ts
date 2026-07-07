import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const secretmanagementizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type SecretmanagementizabilityAdminDomain = z.infer<typeof secretmanagementizabilityAdminDomainSchema>

export const secretmanagementizabilityAdminRecordSchema = z.object({
  domain: secretmanagementizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SecretmanagementizabilityAdminRecord = z.infer<typeof secretmanagementizabilityAdminRecordSchema>

export const secretmanagementizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  secretmanagementizabilityPercent: z.number().min(0).max(100),
})
export type SecretmanagementizabilityAdminStats = z.infer<typeof secretmanagementizabilityAdminStatsSchema>

export const secretmanagementizabilityAdminActionSchema = z.enum(['refresh_secretmanagementizability_summary'])
export type SecretmanagementizabilityAdminAction = z.infer<typeof secretmanagementizabilityAdminActionSchema>

export const secretmanagementizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(secretmanagementizabilityAdminRecordSchema),
  stats: secretmanagementizabilityAdminStatsSchema,
  availableActions: z.array(secretmanagementizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SecretmanagementizabilityAdminSummaryResponse = z.infer<
  typeof secretmanagementizabilityAdminSummaryResponseSchema
>

export const secretmanagementizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: secretmanagementizabilityAdminActionSchema,
})
export type SecretmanagementizabilityAdminActionRequest = z.infer<
  typeof secretmanagementizabilityAdminActionRequestSchema
>

export const secretmanagementizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: secretmanagementizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: secretmanagementizabilityAdminStatsSchema.optional(),
})
export type SecretmanagementizabilityAdminActionResponse = z.infer<
  typeof secretmanagementizabilityAdminActionResponseSchema
>
