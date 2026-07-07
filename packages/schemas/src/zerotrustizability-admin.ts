import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const zerotrustizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type ZerotrustizabilityAdminDomain = z.infer<typeof zerotrustizabilityAdminDomainSchema>

export const zerotrustizabilityAdminRecordSchema = z.object({
  domain: zerotrustizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ZerotrustizabilityAdminRecord = z.infer<typeof zerotrustizabilityAdminRecordSchema>

export const zerotrustizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  zerotrustizabilityPercent: z.number().min(0).max(100),
})
export type ZerotrustizabilityAdminStats = z.infer<typeof zerotrustizabilityAdminStatsSchema>

export const zerotrustizabilityAdminActionSchema = z.enum(['refresh_zerotrustizability_summary'])
export type ZerotrustizabilityAdminAction = z.infer<typeof zerotrustizabilityAdminActionSchema>

export const zerotrustizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(zerotrustizabilityAdminRecordSchema),
  stats: zerotrustizabilityAdminStatsSchema,
  availableActions: z.array(zerotrustizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ZerotrustizabilityAdminSummaryResponse = z.infer<
  typeof zerotrustizabilityAdminSummaryResponseSchema
>

export const zerotrustizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: zerotrustizabilityAdminActionSchema,
})
export type ZerotrustizabilityAdminActionRequest = z.infer<
  typeof zerotrustizabilityAdminActionRequestSchema
>

export const zerotrustizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: zerotrustizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: zerotrustizabilityAdminStatsSchema.optional(),
})
export type ZerotrustizabilityAdminActionResponse = z.infer<
  typeof zerotrustizabilityAdminActionResponseSchema
>
