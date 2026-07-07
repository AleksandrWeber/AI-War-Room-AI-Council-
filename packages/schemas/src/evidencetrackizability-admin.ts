import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const evidencetrackizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type EvidencetrackizabilityAdminDomain = z.infer<typeof evidencetrackizabilityAdminDomainSchema>

export const evidencetrackizabilityAdminRecordSchema = z.object({
  domain: evidencetrackizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EvidencetrackizabilityAdminRecord = z.infer<typeof evidencetrackizabilityAdminRecordSchema>

export const evidencetrackizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  evidencetrackizabilityPercent: z.number().min(0).max(100),
})
export type EvidencetrackizabilityAdminStats = z.infer<typeof evidencetrackizabilityAdminStatsSchema>

export const evidencetrackizabilityAdminActionSchema = z.enum(['refresh_evidencetrackizability_summary'])
export type EvidencetrackizabilityAdminAction = z.infer<typeof evidencetrackizabilityAdminActionSchema>

export const evidencetrackizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(evidencetrackizabilityAdminRecordSchema),
  stats: evidencetrackizabilityAdminStatsSchema,
  availableActions: z.array(evidencetrackizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EvidencetrackizabilityAdminSummaryResponse = z.infer<
  typeof evidencetrackizabilityAdminSummaryResponseSchema
>

export const evidencetrackizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: evidencetrackizabilityAdminActionSchema,
})
export type EvidencetrackizabilityAdminActionRequest = z.infer<
  typeof evidencetrackizabilityAdminActionRequestSchema
>

export const evidencetrackizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: evidencetrackizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: evidencetrackizabilityAdminStatsSchema.optional(),
})
export type EvidencetrackizabilityAdminActionResponse = z.infer<
  typeof evidencetrackizabilityAdminActionResponseSchema
>
