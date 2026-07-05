import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const pragmatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type PragmatizabilityAdminDomain = z.infer<typeof pragmatizabilityAdminDomainSchema>

export const pragmatizabilityAdminRecordSchema = z.object({
  domain: pragmatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PragmatizabilityAdminRecord = z.infer<typeof pragmatizabilityAdminRecordSchema>

export const pragmatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  pragmatizabilityPercent: z.number().min(0).max(100),
})
export type PragmatizabilityAdminStats = z.infer<typeof pragmatizabilityAdminStatsSchema>

export const pragmatizabilityAdminActionSchema = z.enum(['refresh_pragmatizability_summary'])
export type PragmatizabilityAdminAction = z.infer<typeof pragmatizabilityAdminActionSchema>

export const pragmatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(pragmatizabilityAdminRecordSchema),
  stats: pragmatizabilityAdminStatsSchema,
  availableActions: z.array(pragmatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PragmatizabilityAdminSummaryResponse = z.infer<
  typeof pragmatizabilityAdminSummaryResponseSchema
>

export const pragmatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: pragmatizabilityAdminActionSchema,
})
export type PragmatizabilityAdminActionRequest = z.infer<
  typeof pragmatizabilityAdminActionRequestSchema
>

export const pragmatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: pragmatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: pragmatizabilityAdminStatsSchema.optional(),
})
export type PragmatizabilityAdminActionResponse = z.infer<
  typeof pragmatizabilityAdminActionResponseSchema
>
