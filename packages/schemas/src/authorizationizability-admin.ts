import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const authorizationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type AuthorizationizabilityAdminDomain = z.infer<typeof authorizationizabilityAdminDomainSchema>

export const authorizationizabilityAdminRecordSchema = z.object({
  domain: authorizationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuthorizationizabilityAdminRecord = z.infer<typeof authorizationizabilityAdminRecordSchema>

export const authorizationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  authorizationizabilityPercent: z.number().min(0).max(100),
})
export type AuthorizationizabilityAdminStats = z.infer<typeof authorizationizabilityAdminStatsSchema>

export const authorizationizabilityAdminActionSchema = z.enum(['refresh_authorizationizability_summary'])
export type AuthorizationizabilityAdminAction = z.infer<typeof authorizationizabilityAdminActionSchema>

export const authorizationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(authorizationizabilityAdminRecordSchema),
  stats: authorizationizabilityAdminStatsSchema,
  availableActions: z.array(authorizationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuthorizationizabilityAdminSummaryResponse = z.infer<
  typeof authorizationizabilityAdminSummaryResponseSchema
>

export const authorizationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: authorizationizabilityAdminActionSchema,
})
export type AuthorizationizabilityAdminActionRequest = z.infer<
  typeof authorizationizabilityAdminActionRequestSchema
>

export const authorizationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: authorizationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: authorizationizabilityAdminStatsSchema.optional(),
})
export type AuthorizationizabilityAdminActionResponse = z.infer<
  typeof authorizationizabilityAdminActionResponseSchema
>
