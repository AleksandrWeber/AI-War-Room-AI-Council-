import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const compactionizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type CompactionizabilityAdminDomain = z.infer<typeof compactionizabilityAdminDomainSchema>

export const compactionizabilityAdminRecordSchema = z.object({
  domain: compactionizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CompactionizabilityAdminRecord = z.infer<typeof compactionizabilityAdminRecordSchema>

export const compactionizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  compactionizabilityPercent: z.number().min(0).max(100),
})
export type CompactionizabilityAdminStats = z.infer<typeof compactionizabilityAdminStatsSchema>

export const compactionizabilityAdminActionSchema = z.enum(['refresh_compactionizability_summary'])
export type CompactionizabilityAdminAction = z.infer<typeof compactionizabilityAdminActionSchema>

export const compactionizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(compactionizabilityAdminRecordSchema),
  stats: compactionizabilityAdminStatsSchema,
  availableActions: z.array(compactionizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CompactionizabilityAdminSummaryResponse = z.infer<
  typeof compactionizabilityAdminSummaryResponseSchema
>

export const compactionizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compactionizabilityAdminActionSchema,
})
export type CompactionizabilityAdminActionRequest = z.infer<
  typeof compactionizabilityAdminActionRequestSchema
>

export const compactionizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compactionizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: compactionizabilityAdminStatsSchema.optional(),
})
export type CompactionizabilityAdminActionResponse = z.infer<
  typeof compactionizabilityAdminActionResponseSchema
>
