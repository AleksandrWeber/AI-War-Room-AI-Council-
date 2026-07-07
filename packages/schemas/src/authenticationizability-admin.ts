import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const authenticationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type AuthenticationizabilityAdminDomain = z.infer<typeof authenticationizabilityAdminDomainSchema>

export const authenticationizabilityAdminRecordSchema = z.object({
  domain: authenticationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuthenticationizabilityAdminRecord = z.infer<typeof authenticationizabilityAdminRecordSchema>

export const authenticationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  authenticationizabilityPercent: z.number().min(0).max(100),
})
export type AuthenticationizabilityAdminStats = z.infer<typeof authenticationizabilityAdminStatsSchema>

export const authenticationizabilityAdminActionSchema = z.enum(['refresh_authenticationizability_summary'])
export type AuthenticationizabilityAdminAction = z.infer<typeof authenticationizabilityAdminActionSchema>

export const authenticationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(authenticationizabilityAdminRecordSchema),
  stats: authenticationizabilityAdminStatsSchema,
  availableActions: z.array(authenticationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuthenticationizabilityAdminSummaryResponse = z.infer<
  typeof authenticationizabilityAdminSummaryResponseSchema
>

export const authenticationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: authenticationizabilityAdminActionSchema,
})
export type AuthenticationizabilityAdminActionRequest = z.infer<
  typeof authenticationizabilityAdminActionRequestSchema
>

export const authenticationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: authenticationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: authenticationizabilityAdminStatsSchema.optional(),
})
export type AuthenticationizabilityAdminActionResponse = z.infer<
  typeof authenticationizabilityAdminActionResponseSchema
>
