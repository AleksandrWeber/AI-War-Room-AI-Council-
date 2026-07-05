import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const virtualizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type VirtualizabilityAdminDomain = z.infer<typeof virtualizabilityAdminDomainSchema>

export const virtualizabilityAdminRecordSchema = z.object({
  domain: virtualizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type VirtualizabilityAdminRecord = z.infer<typeof virtualizabilityAdminRecordSchema>

export const virtualizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  virtualizabilityPercent: z.number().min(0).max(100),
})
export type VirtualizabilityAdminStats = z.infer<typeof virtualizabilityAdminStatsSchema>

export const virtualizabilityAdminActionSchema = z.enum(['refresh_virtualizability_summary'])
export type VirtualizabilityAdminAction = z.infer<typeof virtualizabilityAdminActionSchema>

export const virtualizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(virtualizabilityAdminRecordSchema),
  stats: virtualizabilityAdminStatsSchema,
  availableActions: z.array(virtualizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type VirtualizabilityAdminSummaryResponse = z.infer<
  typeof virtualizabilityAdminSummaryResponseSchema
>

export const virtualizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: virtualizabilityAdminActionSchema,
})
export type VirtualizabilityAdminActionRequest = z.infer<
  typeof virtualizabilityAdminActionRequestSchema
>

export const virtualizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: virtualizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: virtualizabilityAdminStatsSchema.optional(),
})
export type VirtualizabilityAdminActionResponse = z.infer<
  typeof virtualizabilityAdminActionResponseSchema
>
