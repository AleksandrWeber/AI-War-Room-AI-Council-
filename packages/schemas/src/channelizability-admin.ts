import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const channelizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ChannelizabilityAdminDomain = z.infer<typeof channelizabilityAdminDomainSchema>

export const channelizabilityAdminRecordSchema = z.object({
  domain: channelizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ChannelizabilityAdminRecord = z.infer<typeof channelizabilityAdminRecordSchema>

export const channelizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  channelizabilityPercent: z.number().min(0).max(100),
})
export type ChannelizabilityAdminStats = z.infer<typeof channelizabilityAdminStatsSchema>

export const channelizabilityAdminActionSchema = z.enum(['refresh_channelizability_summary'])
export type ChannelizabilityAdminAction = z.infer<typeof channelizabilityAdminActionSchema>

export const channelizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(channelizabilityAdminRecordSchema),
  stats: channelizabilityAdminStatsSchema,
  availableActions: z.array(channelizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ChannelizabilityAdminSummaryResponse = z.infer<
  typeof channelizabilityAdminSummaryResponseSchema
>

export const channelizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: channelizabilityAdminActionSchema,
})
export type ChannelizabilityAdminActionRequest = z.infer<
  typeof channelizabilityAdminActionRequestSchema
>

export const channelizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: channelizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: channelizabilityAdminStatsSchema.optional(),
})
export type ChannelizabilityAdminActionResponse = z.infer<
  typeof channelizabilityAdminActionResponseSchema
>
