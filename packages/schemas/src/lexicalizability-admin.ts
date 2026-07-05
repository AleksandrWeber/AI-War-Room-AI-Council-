import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const lexicalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type LexicalizabilityAdminDomain = z.infer<typeof lexicalizabilityAdminDomainSchema>

export const lexicalizabilityAdminRecordSchema = z.object({
  domain: lexicalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type LexicalizabilityAdminRecord = z.infer<typeof lexicalizabilityAdminRecordSchema>

export const lexicalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  lexicalizabilityPercent: z.number().min(0).max(100),
})
export type LexicalizabilityAdminStats = z.infer<typeof lexicalizabilityAdminStatsSchema>

export const lexicalizabilityAdminActionSchema = z.enum(['refresh_lexicalizability_summary'])
export type LexicalizabilityAdminAction = z.infer<typeof lexicalizabilityAdminActionSchema>

export const lexicalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(lexicalizabilityAdminRecordSchema),
  stats: lexicalizabilityAdminStatsSchema,
  availableActions: z.array(lexicalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type LexicalizabilityAdminSummaryResponse = z.infer<
  typeof lexicalizabilityAdminSummaryResponseSchema
>

export const lexicalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: lexicalizabilityAdminActionSchema,
})
export type LexicalizabilityAdminActionRequest = z.infer<
  typeof lexicalizabilityAdminActionRequestSchema
>

export const lexicalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: lexicalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: lexicalizabilityAdminStatsSchema.optional(),
})
export type LexicalizabilityAdminActionResponse = z.infer<
  typeof lexicalizabilityAdminActionResponseSchema
>
