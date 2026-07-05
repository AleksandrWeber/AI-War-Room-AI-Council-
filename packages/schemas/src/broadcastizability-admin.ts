import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const broadcastizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type BroadcastizabilityAdminDomain = z.infer<typeof broadcastizabilityAdminDomainSchema>

export const broadcastizabilityAdminRecordSchema = z.object({
  domain: broadcastizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BroadcastizabilityAdminRecord = z.infer<typeof broadcastizabilityAdminRecordSchema>

export const broadcastizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  broadcastizabilityPercent: z.number().min(0).max(100),
})
export type BroadcastizabilityAdminStats = z.infer<typeof broadcastizabilityAdminStatsSchema>

export const broadcastizabilityAdminActionSchema = z.enum(['refresh_broadcastizability_summary'])
export type BroadcastizabilityAdminAction = z.infer<typeof broadcastizabilityAdminActionSchema>

export const broadcastizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(broadcastizabilityAdminRecordSchema),
  stats: broadcastizabilityAdminStatsSchema,
  availableActions: z.array(broadcastizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BroadcastizabilityAdminSummaryResponse = z.infer<
  typeof broadcastizabilityAdminSummaryResponseSchema
>

export const broadcastizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: broadcastizabilityAdminActionSchema,
})
export type BroadcastizabilityAdminActionRequest = z.infer<
  typeof broadcastizabilityAdminActionRequestSchema
>

export const broadcastizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: broadcastizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: broadcastizabilityAdminStatsSchema.optional(),
})
export type BroadcastizabilityAdminActionResponse = z.infer<
  typeof broadcastizabilityAdminActionResponseSchema
>
