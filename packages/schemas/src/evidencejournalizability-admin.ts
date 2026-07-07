import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const evidencejournalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type EvidencejournalizabilityAdminDomain = z.infer<typeof evidencejournalizabilityAdminDomainSchema>

export const evidencejournalizabilityAdminRecordSchema = z.object({
  domain: evidencejournalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EvidencejournalizabilityAdminRecord = z.infer<typeof evidencejournalizabilityAdminRecordSchema>

export const evidencejournalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  evidencejournalizabilityPercent: z.number().min(0).max(100),
})
export type EvidencejournalizabilityAdminStats = z.infer<typeof evidencejournalizabilityAdminStatsSchema>

export const evidencejournalizabilityAdminActionSchema = z.enum(['refresh_evidencejournalizability_summary'])
export type EvidencejournalizabilityAdminAction = z.infer<typeof evidencejournalizabilityAdminActionSchema>

export const evidencejournalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(evidencejournalizabilityAdminRecordSchema),
  stats: evidencejournalizabilityAdminStatsSchema,
  availableActions: z.array(evidencejournalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EvidencejournalizabilityAdminSummaryResponse = z.infer<
  typeof evidencejournalizabilityAdminSummaryResponseSchema
>

export const evidencejournalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: evidencejournalizabilityAdminActionSchema,
})
export type EvidencejournalizabilityAdminActionRequest = z.infer<
  typeof evidencejournalizabilityAdminActionRequestSchema
>

export const evidencejournalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: evidencejournalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: evidencejournalizabilityAdminStatsSchema.optional(),
})
export type EvidencejournalizabilityAdminActionResponse = z.infer<
  typeof evidencejournalizabilityAdminActionResponseSchema
>
