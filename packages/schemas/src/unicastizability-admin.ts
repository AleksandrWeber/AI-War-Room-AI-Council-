import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const unicastizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type UnicastizabilityAdminDomain = z.infer<typeof unicastizabilityAdminDomainSchema>

export const unicastizabilityAdminRecordSchema = z.object({
  domain: unicastizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type UnicastizabilityAdminRecord = z.infer<typeof unicastizabilityAdminRecordSchema>

export const unicastizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  unicastizabilityPercent: z.number().min(0).max(100),
})
export type UnicastizabilityAdminStats = z.infer<typeof unicastizabilityAdminStatsSchema>

export const unicastizabilityAdminActionSchema = z.enum(['refresh_unicastizability_summary'])
export type UnicastizabilityAdminAction = z.infer<typeof unicastizabilityAdminActionSchema>

export const unicastizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(unicastizabilityAdminRecordSchema),
  stats: unicastizabilityAdminStatsSchema,
  availableActions: z.array(unicastizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type UnicastizabilityAdminSummaryResponse = z.infer<
  typeof unicastizabilityAdminSummaryResponseSchema
>

export const unicastizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: unicastizabilityAdminActionSchema,
})
export type UnicastizabilityAdminActionRequest = z.infer<
  typeof unicastizabilityAdminActionRequestSchema
>

export const unicastizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: unicastizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: unicastizabilityAdminStatsSchema.optional(),
})
export type UnicastizabilityAdminActionResponse = z.infer<
  typeof unicastizabilityAdminActionResponseSchema
>
