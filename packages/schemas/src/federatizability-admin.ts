import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const federatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_usage_limits',
  'usage_events',
])
export type FederatizabilityAdminDomain = z.infer<typeof federatizabilityAdminDomainSchema>

export const federatizabilityAdminRecordSchema = z.object({
  domain: federatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FederatizabilityAdminRecord = z.infer<typeof federatizabilityAdminRecordSchema>

export const federatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  federatizabilityPercent: z.number().min(0).max(100),
})
export type FederatizabilityAdminStats = z.infer<typeof federatizabilityAdminStatsSchema>

export const federatizabilityAdminActionSchema = z.enum(['refresh_federatizability_summary'])
export type FederatizabilityAdminAction = z.infer<typeof federatizabilityAdminActionSchema>

export const federatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(federatizabilityAdminRecordSchema),
  stats: federatizabilityAdminStatsSchema,
  availableActions: z.array(federatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FederatizabilityAdminSummaryResponse = z.infer<
  typeof federatizabilityAdminSummaryResponseSchema
>

export const federatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: federatizabilityAdminActionSchema,
})
export type FederatizabilityAdminActionRequest = z.infer<
  typeof federatizabilityAdminActionRequestSchema
>

export const federatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: federatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: federatizabilityAdminStatsSchema.optional(),
})
export type FederatizabilityAdminActionResponse = z.infer<
  typeof federatizabilityAdminActionResponseSchema
>
