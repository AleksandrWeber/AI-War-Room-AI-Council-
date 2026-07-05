import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const streamizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type StreamizabilityAdminDomain = z.infer<typeof streamizabilityAdminDomainSchema>

export const streamizabilityAdminRecordSchema = z.object({
  domain: streamizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type StreamizabilityAdminRecord = z.infer<typeof streamizabilityAdminRecordSchema>

export const streamizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  streamizabilityPercent: z.number().min(0).max(100),
})
export type StreamizabilityAdminStats = z.infer<typeof streamizabilityAdminStatsSchema>

export const streamizabilityAdminActionSchema = z.enum(['refresh_streamizability_summary'])
export type StreamizabilityAdminAction = z.infer<typeof streamizabilityAdminActionSchema>

export const streamizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(streamizabilityAdminRecordSchema),
  stats: streamizabilityAdminStatsSchema,
  availableActions: z.array(streamizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type StreamizabilityAdminSummaryResponse = z.infer<
  typeof streamizabilityAdminSummaryResponseSchema
>

export const streamizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: streamizabilityAdminActionSchema,
})
export type StreamizabilityAdminActionRequest = z.infer<
  typeof streamizabilityAdminActionRequestSchema
>

export const streamizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: streamizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: streamizabilityAdminStatsSchema.optional(),
})
export type StreamizabilityAdminActionResponse = z.infer<
  typeof streamizabilityAdminActionResponseSchema
>
