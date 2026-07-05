import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const identifiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type IdentifiabilityAdminDomain = z.infer<typeof identifiabilityAdminDomainSchema>

export const identifiabilityAdminRecordSchema = z.object({
  domain: identifiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IdentifiabilityAdminRecord = z.infer<typeof identifiabilityAdminRecordSchema>

export const identifiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  identifiabilityPercent: z.number().min(0).max(100),
})
export type IdentifiabilityAdminStats = z.infer<typeof identifiabilityAdminStatsSchema>

export const identifiabilityAdminActionSchema = z.enum(['refresh_identifiability_summary'])
export type IdentifiabilityAdminAction = z.infer<typeof identifiabilityAdminActionSchema>

export const identifiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(identifiabilityAdminRecordSchema),
  stats: identifiabilityAdminStatsSchema,
  availableActions: z.array(identifiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IdentifiabilityAdminSummaryResponse = z.infer<
  typeof identifiabilityAdminSummaryResponseSchema
>

export const identifiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: identifiabilityAdminActionSchema,
})
export type IdentifiabilityAdminActionRequest = z.infer<
  typeof identifiabilityAdminActionRequestSchema
>

export const identifiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: identifiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: identifiabilityAdminStatsSchema.optional(),
})
export type IdentifiabilityAdminActionResponse = z.infer<
  typeof identifiabilityAdminActionResponseSchema
>
