import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const predictabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type PredictabilityvaultizabilityAdminDomain = z.infer<typeof predictabilityvaultizabilityAdminDomainSchema>

export const predictabilityvaultizabilityAdminRecordSchema = z.object({
  domain: predictabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PredictabilityvaultizabilityAdminRecord = z.infer<typeof predictabilityvaultizabilityAdminRecordSchema>

export const predictabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  predictabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type PredictabilityvaultizabilityAdminStats = z.infer<typeof predictabilityvaultizabilityAdminStatsSchema>

export const predictabilityvaultizabilityAdminActionSchema = z.enum(['refresh_predictabilityvaultizability_summary'])
export type PredictabilityvaultizabilityAdminAction = z.infer<typeof predictabilityvaultizabilityAdminActionSchema>

export const predictabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(predictabilityvaultizabilityAdminRecordSchema),
  stats: predictabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(predictabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PredictabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof predictabilityvaultizabilityAdminSummaryResponseSchema
>

export const predictabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: predictabilityvaultizabilityAdminActionSchema,
})
export type PredictabilityvaultizabilityAdminActionRequest = z.infer<
  typeof predictabilityvaultizabilityAdminActionRequestSchema
>

export const predictabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: predictabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: predictabilityvaultizabilityAdminStatsSchema.optional(),
})
export type PredictabilityvaultizabilityAdminActionResponse = z.infer<
  typeof predictabilityvaultizabilityAdminActionResponseSchema
>
