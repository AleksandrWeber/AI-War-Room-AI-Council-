import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const evidencevaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type EvidencevaultizabilityAdminDomain = z.infer<typeof evidencevaultizabilityAdminDomainSchema>

export const evidencevaultizabilityAdminRecordSchema = z.object({
  domain: evidencevaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EvidencevaultizabilityAdminRecord = z.infer<typeof evidencevaultizabilityAdminRecordSchema>

export const evidencevaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  evidencevaultizabilityPercent: z.number().min(0).max(100),
})
export type EvidencevaultizabilityAdminStats = z.infer<typeof evidencevaultizabilityAdminStatsSchema>

export const evidencevaultizabilityAdminActionSchema = z.enum(['refresh_evidencevaultizability_summary'])
export type EvidencevaultizabilityAdminAction = z.infer<typeof evidencevaultizabilityAdminActionSchema>

export const evidencevaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(evidencevaultizabilityAdminRecordSchema),
  stats: evidencevaultizabilityAdminStatsSchema,
  availableActions: z.array(evidencevaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EvidencevaultizabilityAdminSummaryResponse = z.infer<
  typeof evidencevaultizabilityAdminSummaryResponseSchema
>

export const evidencevaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: evidencevaultizabilityAdminActionSchema,
})
export type EvidencevaultizabilityAdminActionRequest = z.infer<
  typeof evidencevaultizabilityAdminActionRequestSchema
>

export const evidencevaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: evidencevaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: evidencevaultizabilityAdminStatsSchema.optional(),
})
export type EvidencevaultizabilityAdminActionResponse = z.infer<
  typeof evidencevaultizabilityAdminActionResponseSchema
>
