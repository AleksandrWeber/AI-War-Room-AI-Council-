import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const mitigationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type MitigationizabilityAdminDomain = z.infer<typeof mitigationizabilityAdminDomainSchema>

export const mitigationizabilityAdminRecordSchema = z.object({
  domain: mitigationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MitigationizabilityAdminRecord = z.infer<typeof mitigationizabilityAdminRecordSchema>

export const mitigationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  mitigationizabilityPercent: z.number().min(0).max(100),
})
export type MitigationizabilityAdminStats = z.infer<typeof mitigationizabilityAdminStatsSchema>

export const mitigationizabilityAdminActionSchema = z.enum(['refresh_mitigationizability_summary'])
export type MitigationizabilityAdminAction = z.infer<typeof mitigationizabilityAdminActionSchema>

export const mitigationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(mitigationizabilityAdminRecordSchema),
  stats: mitigationizabilityAdminStatsSchema,
  availableActions: z.array(mitigationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MitigationizabilityAdminSummaryResponse = z.infer<
  typeof mitigationizabilityAdminSummaryResponseSchema
>

export const mitigationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: mitigationizabilityAdminActionSchema,
})
export type MitigationizabilityAdminActionRequest = z.infer<
  typeof mitigationizabilityAdminActionRequestSchema
>

export const mitigationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: mitigationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: mitigationizabilityAdminStatsSchema.optional(),
})
export type MitigationizabilityAdminActionResponse = z.infer<
  typeof mitigationizabilityAdminActionResponseSchema
>
