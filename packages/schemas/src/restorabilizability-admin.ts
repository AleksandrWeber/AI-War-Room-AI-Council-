import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const restorabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type RestorabilizabilityAdminDomain = z.infer<typeof restorabilizabilityAdminDomainSchema>

export const restorabilizabilityAdminRecordSchema = z.object({
  domain: restorabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RestorabilizabilityAdminRecord = z.infer<typeof restorabilizabilityAdminRecordSchema>

export const restorabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  restorabilizabilityPercent: z.number().min(0).max(100),
})
export type RestorabilizabilityAdminStats = z.infer<typeof restorabilizabilityAdminStatsSchema>

export const restorabilizabilityAdminActionSchema = z.enum(['refresh_restorabilizability_summary'])
export type RestorabilizabilityAdminAction = z.infer<typeof restorabilizabilityAdminActionSchema>

export const restorabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(restorabilizabilityAdminRecordSchema),
  stats: restorabilizabilityAdminStatsSchema,
  availableActions: z.array(restorabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RestorabilizabilityAdminSummaryResponse = z.infer<
  typeof restorabilizabilityAdminSummaryResponseSchema
>

export const restorabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: restorabilizabilityAdminActionSchema,
})
export type RestorabilizabilityAdminActionRequest = z.infer<
  typeof restorabilizabilityAdminActionRequestSchema
>

export const restorabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: restorabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: restorabilizabilityAdminStatsSchema.optional(),
})
export type RestorabilizabilityAdminActionResponse = z.infer<
  typeof restorabilizabilityAdminActionResponseSchema
>
