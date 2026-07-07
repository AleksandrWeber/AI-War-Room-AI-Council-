import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const integrityjournalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type IntegrityjournalizabilityAdminDomain = z.infer<typeof integrityjournalizabilityAdminDomainSchema>

export const integrityjournalizabilityAdminRecordSchema = z.object({
  domain: integrityjournalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IntegrityjournalizabilityAdminRecord = z.infer<typeof integrityjournalizabilityAdminRecordSchema>

export const integrityjournalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  integrityjournalizabilityPercent: z.number().min(0).max(100),
})
export type IntegrityjournalizabilityAdminStats = z.infer<typeof integrityjournalizabilityAdminStatsSchema>

export const integrityjournalizabilityAdminActionSchema = z.enum(['refresh_integrityjournalizability_summary'])
export type IntegrityjournalizabilityAdminAction = z.infer<typeof integrityjournalizabilityAdminActionSchema>

export const integrityjournalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(integrityjournalizabilityAdminRecordSchema),
  stats: integrityjournalizabilityAdminStatsSchema,
  availableActions: z.array(integrityjournalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IntegrityjournalizabilityAdminSummaryResponse = z.infer<
  typeof integrityjournalizabilityAdminSummaryResponseSchema
>

export const integrityjournalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: integrityjournalizabilityAdminActionSchema,
})
export type IntegrityjournalizabilityAdminActionRequest = z.infer<
  typeof integrityjournalizabilityAdminActionRequestSchema
>

export const integrityjournalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: integrityjournalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: integrityjournalizabilityAdminStatsSchema.optional(),
})
export type IntegrityjournalizabilityAdminActionResponse = z.infer<
  typeof integrityjournalizabilityAdminActionResponseSchema
>
