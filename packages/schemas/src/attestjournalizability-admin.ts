import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const attestjournalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type AttestjournalizabilityAdminDomain = z.infer<typeof attestjournalizabilityAdminDomainSchema>

export const attestjournalizabilityAdminRecordSchema = z.object({
  domain: attestjournalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AttestjournalizabilityAdminRecord = z.infer<typeof attestjournalizabilityAdminRecordSchema>

export const attestjournalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  attestjournalizabilityPercent: z.number().min(0).max(100),
})
export type AttestjournalizabilityAdminStats = z.infer<typeof attestjournalizabilityAdminStatsSchema>

export const attestjournalizabilityAdminActionSchema = z.enum(['refresh_attestjournalizability_summary'])
export type AttestjournalizabilityAdminAction = z.infer<typeof attestjournalizabilityAdminActionSchema>

export const attestjournalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(attestjournalizabilityAdminRecordSchema),
  stats: attestjournalizabilityAdminStatsSchema,
  availableActions: z.array(attestjournalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AttestjournalizabilityAdminSummaryResponse = z.infer<
  typeof attestjournalizabilityAdminSummaryResponseSchema
>

export const attestjournalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attestjournalizabilityAdminActionSchema,
})
export type AttestjournalizabilityAdminActionRequest = z.infer<
  typeof attestjournalizabilityAdminActionRequestSchema
>

export const attestjournalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attestjournalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: attestjournalizabilityAdminStatsSchema.optional(),
})
export type AttestjournalizabilityAdminActionResponse = z.infer<
  typeof attestjournalizabilityAdminActionResponseSchema
>
