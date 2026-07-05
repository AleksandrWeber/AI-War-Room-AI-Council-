import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const sequencizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type SequencizabilityAdminDomain = z.infer<typeof sequencizabilityAdminDomainSchema>

export const sequencizabilityAdminRecordSchema = z.object({
  domain: sequencizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SequencizabilityAdminRecord = z.infer<typeof sequencizabilityAdminRecordSchema>

export const sequencizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  sequencizabilityPercent: z.number().min(0).max(100),
})
export type SequencizabilityAdminStats = z.infer<typeof sequencizabilityAdminStatsSchema>

export const sequencizabilityAdminActionSchema = z.enum(['refresh_sequencizability_summary'])
export type SequencizabilityAdminAction = z.infer<typeof sequencizabilityAdminActionSchema>

export const sequencizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(sequencizabilityAdminRecordSchema),
  stats: sequencizabilityAdminStatsSchema,
  availableActions: z.array(sequencizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SequencizabilityAdminSummaryResponse = z.infer<
  typeof sequencizabilityAdminSummaryResponseSchema
>

export const sequencizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: sequencizabilityAdminActionSchema,
})
export type SequencizabilityAdminActionRequest = z.infer<
  typeof sequencizabilityAdminActionRequestSchema
>

export const sequencizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: sequencizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: sequencizabilityAdminStatsSchema.optional(),
})
export type SequencizabilityAdminActionResponse = z.infer<
  typeof sequencizabilityAdminActionResponseSchema
>
