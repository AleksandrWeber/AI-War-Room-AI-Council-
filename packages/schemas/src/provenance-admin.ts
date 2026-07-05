import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const provenanceAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'artifacts',
])
export type ProvenanceAdminDomain = z.infer<typeof provenanceAdminDomainSchema>

export const provenanceAdminRecordSchema = z.object({
  domain: provenanceAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProvenanceAdminRecord = z.infer<typeof provenanceAdminRecordSchema>

export const provenanceAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  provenancePercent: z.number().min(0).max(100),
})
export type ProvenanceAdminStats = z.infer<typeof provenanceAdminStatsSchema>

export const provenanceAdminActionSchema = z.enum(['refresh_provenance_summary'])
export type ProvenanceAdminAction = z.infer<typeof provenanceAdminActionSchema>

export const provenanceAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(provenanceAdminRecordSchema),
  stats: provenanceAdminStatsSchema,
  availableActions: z.array(provenanceAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProvenanceAdminSummaryResponse = z.infer<
  typeof provenanceAdminSummaryResponseSchema
>

export const provenanceAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: provenanceAdminActionSchema,
})
export type ProvenanceAdminActionRequest = z.infer<
  typeof provenanceAdminActionRequestSchema
>

export const provenanceAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: provenanceAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: provenanceAdminStatsSchema.optional(),
})
export type ProvenanceAdminActionResponse = z.infer<
  typeof provenanceAdminActionResponseSchema
>
