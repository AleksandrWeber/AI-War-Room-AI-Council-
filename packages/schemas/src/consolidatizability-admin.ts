import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const consolidatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type ConsolidatizabilityAdminDomain = z.infer<typeof consolidatizabilityAdminDomainSchema>

export const consolidatizabilityAdminRecordSchema = z.object({
  domain: consolidatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConsolidatizabilityAdminRecord = z.infer<typeof consolidatizabilityAdminRecordSchema>

export const consolidatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  consolidatizabilityPercent: z.number().min(0).max(100),
})
export type ConsolidatizabilityAdminStats = z.infer<typeof consolidatizabilityAdminStatsSchema>

export const consolidatizabilityAdminActionSchema = z.enum(['refresh_consolidatizability_summary'])
export type ConsolidatizabilityAdminAction = z.infer<typeof consolidatizabilityAdminActionSchema>

export const consolidatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(consolidatizabilityAdminRecordSchema),
  stats: consolidatizabilityAdminStatsSchema,
  availableActions: z.array(consolidatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConsolidatizabilityAdminSummaryResponse = z.infer<
  typeof consolidatizabilityAdminSummaryResponseSchema
>

export const consolidatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: consolidatizabilityAdminActionSchema,
})
export type ConsolidatizabilityAdminActionRequest = z.infer<
  typeof consolidatizabilityAdminActionRequestSchema
>

export const consolidatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: consolidatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: consolidatizabilityAdminStatsSchema.optional(),
})
export type ConsolidatizabilityAdminActionResponse = z.infer<
  typeof consolidatizabilityAdminActionResponseSchema
>
