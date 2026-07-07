import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const navigabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type NavigabilityvaultizabilityAdminDomain = z.infer<typeof navigabilityvaultizabilityAdminDomainSchema>

export const navigabilityvaultizabilityAdminRecordSchema = z.object({
  domain: navigabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NavigabilityvaultizabilityAdminRecord = z.infer<typeof navigabilityvaultizabilityAdminRecordSchema>

export const navigabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  navigabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type NavigabilityvaultizabilityAdminStats = z.infer<typeof navigabilityvaultizabilityAdminStatsSchema>

export const navigabilityvaultizabilityAdminActionSchema = z.enum(['refresh_navigabilityvaultizability_summary'])
export type NavigabilityvaultizabilityAdminAction = z.infer<typeof navigabilityvaultizabilityAdminActionSchema>

export const navigabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(navigabilityvaultizabilityAdminRecordSchema),
  stats: navigabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(navigabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NavigabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof navigabilityvaultizabilityAdminSummaryResponseSchema
>

export const navigabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: navigabilityvaultizabilityAdminActionSchema,
})
export type NavigabilityvaultizabilityAdminActionRequest = z.infer<
  typeof navigabilityvaultizabilityAdminActionRequestSchema
>

export const navigabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: navigabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: navigabilityvaultizabilityAdminStatsSchema.optional(),
})
export type NavigabilityvaultizabilityAdminActionResponse = z.infer<
  typeof navigabilityvaultizabilityAdminActionResponseSchema
>
