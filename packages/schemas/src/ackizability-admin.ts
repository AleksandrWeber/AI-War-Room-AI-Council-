import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const ackizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type AckizabilityAdminDomain = z.infer<typeof ackizabilityAdminDomainSchema>

export const ackizabilityAdminRecordSchema = z.object({
  domain: ackizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AckizabilityAdminRecord = z.infer<typeof ackizabilityAdminRecordSchema>

export const ackizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  ackizabilityPercent: z.number().min(0).max(100),
})
export type AckizabilityAdminStats = z.infer<typeof ackizabilityAdminStatsSchema>

export const ackizabilityAdminActionSchema = z.enum(['refresh_ackizability_summary'])
export type AckizabilityAdminAction = z.infer<typeof ackizabilityAdminActionSchema>

export const ackizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(ackizabilityAdminRecordSchema),
  stats: ackizabilityAdminStatsSchema,
  availableActions: z.array(ackizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AckizabilityAdminSummaryResponse = z.infer<
  typeof ackizabilityAdminSummaryResponseSchema
>

export const ackizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ackizabilityAdminActionSchema,
})
export type AckizabilityAdminActionRequest = z.infer<
  typeof ackizabilityAdminActionRequestSchema
>

export const ackizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ackizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: ackizabilityAdminStatsSchema.optional(),
})
export type AckizabilityAdminActionResponse = z.infer<
  typeof ackizabilityAdminActionResponseSchema
>
