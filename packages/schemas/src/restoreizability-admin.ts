import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const restoreizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type RestoreizabilityAdminDomain = z.infer<typeof restoreizabilityAdminDomainSchema>

export const restoreizabilityAdminRecordSchema = z.object({
  domain: restoreizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RestoreizabilityAdminRecord = z.infer<typeof restoreizabilityAdminRecordSchema>

export const restoreizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  restoreizabilityPercent: z.number().min(0).max(100),
})
export type RestoreizabilityAdminStats = z.infer<typeof restoreizabilityAdminStatsSchema>

export const restoreizabilityAdminActionSchema = z.enum(['refresh_restoreizability_summary'])
export type RestoreizabilityAdminAction = z.infer<typeof restoreizabilityAdminActionSchema>

export const restoreizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(restoreizabilityAdminRecordSchema),
  stats: restoreizabilityAdminStatsSchema,
  availableActions: z.array(restoreizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RestoreizabilityAdminSummaryResponse = z.infer<
  typeof restoreizabilityAdminSummaryResponseSchema
>

export const restoreizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: restoreizabilityAdminActionSchema,
})
export type RestoreizabilityAdminActionRequest = z.infer<
  typeof restoreizabilityAdminActionRequestSchema
>

export const restoreizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: restoreizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: restoreizabilityAdminStatsSchema.optional(),
})
export type RestoreizabilityAdminActionResponse = z.infer<
  typeof restoreizabilityAdminActionResponseSchema
>
