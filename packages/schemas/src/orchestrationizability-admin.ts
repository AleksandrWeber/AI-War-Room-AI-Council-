import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const orchestrationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type OrchestrationizabilityAdminDomain = z.infer<typeof orchestrationizabilityAdminDomainSchema>

export const orchestrationizabilityAdminRecordSchema = z.object({
  domain: orchestrationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OrchestrationizabilityAdminRecord = z.infer<typeof orchestrationizabilityAdminRecordSchema>

export const orchestrationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  orchestrationizabilityPercent: z.number().min(0).max(100),
})
export type OrchestrationizabilityAdminStats = z.infer<typeof orchestrationizabilityAdminStatsSchema>

export const orchestrationizabilityAdminActionSchema = z.enum(['refresh_orchestrationizability_summary'])
export type OrchestrationizabilityAdminAction = z.infer<typeof orchestrationizabilityAdminActionSchema>

export const orchestrationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(orchestrationizabilityAdminRecordSchema),
  stats: orchestrationizabilityAdminStatsSchema,
  availableActions: z.array(orchestrationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OrchestrationizabilityAdminSummaryResponse = z.infer<
  typeof orchestrationizabilityAdminSummaryResponseSchema
>

export const orchestrationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: orchestrationizabilityAdminActionSchema,
})
export type OrchestrationizabilityAdminActionRequest = z.infer<
  typeof orchestrationizabilityAdminActionRequestSchema
>

export const orchestrationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: orchestrationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: orchestrationizabilityAdminStatsSchema.optional(),
})
export type OrchestrationizabilityAdminActionResponse = z.infer<
  typeof orchestrationizabilityAdminActionResponseSchema
>
