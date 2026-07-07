import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const securityizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type SecurityizabilityAdminDomain = z.infer<typeof securityizabilityAdminDomainSchema>

export const securityizabilityAdminRecordSchema = z.object({
  domain: securityizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SecurityizabilityAdminRecord = z.infer<typeof securityizabilityAdminRecordSchema>

export const securityizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  securityizabilityPercent: z.number().min(0).max(100),
})
export type SecurityizabilityAdminStats = z.infer<typeof securityizabilityAdminStatsSchema>

export const securityizabilityAdminActionSchema = z.enum(['refresh_securityizability_summary'])
export type SecurityizabilityAdminAction = z.infer<typeof securityizabilityAdminActionSchema>

export const securityizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(securityizabilityAdminRecordSchema),
  stats: securityizabilityAdminStatsSchema,
  availableActions: z.array(securityizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SecurityizabilityAdminSummaryResponse = z.infer<
  typeof securityizabilityAdminSummaryResponseSchema
>

export const securityizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: securityizabilityAdminActionSchema,
})
export type SecurityizabilityAdminActionRequest = z.infer<
  typeof securityizabilityAdminActionRequestSchema
>

export const securityizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: securityizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: securityizabilityAdminStatsSchema.optional(),
})
export type SecurityizabilityAdminActionResponse = z.infer<
  typeof securityizabilityAdminActionResponseSchema
>
