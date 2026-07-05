import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const tokenizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type TokenizabilityAdminDomain = z.infer<typeof tokenizabilityAdminDomainSchema>

export const tokenizabilityAdminRecordSchema = z.object({
  domain: tokenizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TokenizabilityAdminRecord = z.infer<typeof tokenizabilityAdminRecordSchema>

export const tokenizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  tokenizabilityPercent: z.number().min(0).max(100),
})
export type TokenizabilityAdminStats = z.infer<typeof tokenizabilityAdminStatsSchema>

export const tokenizabilityAdminActionSchema = z.enum(['refresh_tokenizability_summary'])
export type TokenizabilityAdminAction = z.infer<typeof tokenizabilityAdminActionSchema>

export const tokenizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(tokenizabilityAdminRecordSchema),
  stats: tokenizabilityAdminStatsSchema,
  availableActions: z.array(tokenizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TokenizabilityAdminSummaryResponse = z.infer<
  typeof tokenizabilityAdminSummaryResponseSchema
>

export const tokenizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tokenizabilityAdminActionSchema,
})
export type TokenizabilityAdminActionRequest = z.infer<
  typeof tokenizabilityAdminActionRequestSchema
>

export const tokenizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tokenizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: tokenizabilityAdminStatsSchema.optional(),
})
export type TokenizabilityAdminActionResponse = z.infer<
  typeof tokenizabilityAdminActionResponseSchema
>
