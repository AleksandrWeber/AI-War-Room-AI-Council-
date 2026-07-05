import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const materializationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type MaterializationizabilityAdminDomain = z.infer<typeof materializationizabilityAdminDomainSchema>

export const materializationizabilityAdminRecordSchema = z.object({
  domain: materializationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MaterializationizabilityAdminRecord = z.infer<typeof materializationizabilityAdminRecordSchema>

export const materializationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  materializationizabilityPercent: z.number().min(0).max(100),
})
export type MaterializationizabilityAdminStats = z.infer<typeof materializationizabilityAdminStatsSchema>

export const materializationizabilityAdminActionSchema = z.enum(['refresh_materializationizability_summary'])
export type MaterializationizabilityAdminAction = z.infer<typeof materializationizabilityAdminActionSchema>

export const materializationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(materializationizabilityAdminRecordSchema),
  stats: materializationizabilityAdminStatsSchema,
  availableActions: z.array(materializationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MaterializationizabilityAdminSummaryResponse = z.infer<
  typeof materializationizabilityAdminSummaryResponseSchema
>

export const materializationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: materializationizabilityAdminActionSchema,
})
export type MaterializationizabilityAdminActionRequest = z.infer<
  typeof materializationizabilityAdminActionRequestSchema
>

export const materializationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: materializationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: materializationizabilityAdminStatsSchema.optional(),
})
export type MaterializationizabilityAdminActionResponse = z.infer<
  typeof materializationizabilityAdminActionResponseSchema
>
