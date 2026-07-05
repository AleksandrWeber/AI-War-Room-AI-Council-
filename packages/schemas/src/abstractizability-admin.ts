import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const abstractizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type AbstractizabilityAdminDomain = z.infer<typeof abstractizabilityAdminDomainSchema>

export const abstractizabilityAdminRecordSchema = z.object({
  domain: abstractizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AbstractizabilityAdminRecord = z.infer<typeof abstractizabilityAdminRecordSchema>

export const abstractizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  abstractizabilityPercent: z.number().min(0).max(100),
})
export type AbstractizabilityAdminStats = z.infer<typeof abstractizabilityAdminStatsSchema>

export const abstractizabilityAdminActionSchema = z.enum(['refresh_abstractizability_summary'])
export type AbstractizabilityAdminAction = z.infer<typeof abstractizabilityAdminActionSchema>

export const abstractizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(abstractizabilityAdminRecordSchema),
  stats: abstractizabilityAdminStatsSchema,
  availableActions: z.array(abstractizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AbstractizabilityAdminSummaryResponse = z.infer<
  typeof abstractizabilityAdminSummaryResponseSchema
>

export const abstractizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: abstractizabilityAdminActionSchema,
})
export type AbstractizabilityAdminActionRequest = z.infer<
  typeof abstractizabilityAdminActionRequestSchema
>

export const abstractizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: abstractizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: abstractizabilityAdminStatsSchema.optional(),
})
export type AbstractizabilityAdminActionResponse = z.infer<
  typeof abstractizabilityAdminActionResponseSchema
>
