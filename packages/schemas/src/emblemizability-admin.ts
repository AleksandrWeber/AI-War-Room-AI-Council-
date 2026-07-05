import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const emblemizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type EmblemizabilityAdminDomain = z.infer<typeof emblemizabilityAdminDomainSchema>

export const emblemizabilityAdminRecordSchema = z.object({
  domain: emblemizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EmblemizabilityAdminRecord = z.infer<typeof emblemizabilityAdminRecordSchema>

export const emblemizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  emblemizabilityPercent: z.number().min(0).max(100),
})
export type EmblemizabilityAdminStats = z.infer<typeof emblemizabilityAdminStatsSchema>

export const emblemizabilityAdminActionSchema = z.enum(['refresh_emblemizability_summary'])
export type EmblemizabilityAdminAction = z.infer<typeof emblemizabilityAdminActionSchema>

export const emblemizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(emblemizabilityAdminRecordSchema),
  stats: emblemizabilityAdminStatsSchema,
  availableActions: z.array(emblemizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EmblemizabilityAdminSummaryResponse = z.infer<
  typeof emblemizabilityAdminSummaryResponseSchema
>

export const emblemizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: emblemizabilityAdminActionSchema,
})
export type EmblemizabilityAdminActionRequest = z.infer<
  typeof emblemizabilityAdminActionRequestSchema
>

export const emblemizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: emblemizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: emblemizabilityAdminStatsSchema.optional(),
})
export type EmblemizabilityAdminActionResponse = z.infer<
  typeof emblemizabilityAdminActionResponseSchema
>
