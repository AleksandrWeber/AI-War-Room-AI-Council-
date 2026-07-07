import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const evidencizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type EvidencizabilityAdminDomain = z.infer<typeof evidencizabilityAdminDomainSchema>

export const evidencizabilityAdminRecordSchema = z.object({
  domain: evidencizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EvidencizabilityAdminRecord = z.infer<typeof evidencizabilityAdminRecordSchema>

export const evidencizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  evidencizabilityPercent: z.number().min(0).max(100),
})
export type EvidencizabilityAdminStats = z.infer<typeof evidencizabilityAdminStatsSchema>

export const evidencizabilityAdminActionSchema = z.enum(['refresh_evidencizability_summary'])
export type EvidencizabilityAdminAction = z.infer<typeof evidencizabilityAdminActionSchema>

export const evidencizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(evidencizabilityAdminRecordSchema),
  stats: evidencizabilityAdminStatsSchema,
  availableActions: z.array(evidencizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EvidencizabilityAdminSummaryResponse = z.infer<
  typeof evidencizabilityAdminSummaryResponseSchema
>

export const evidencizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: evidencizabilityAdminActionSchema,
})
export type EvidencizabilityAdminActionRequest = z.infer<
  typeof evidencizabilityAdminActionRequestSchema
>

export const evidencizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: evidencizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: evidencizabilityAdminStatsSchema.optional(),
})
export type EvidencizabilityAdminActionResponse = z.infer<
  typeof evidencizabilityAdminActionResponseSchema
>
