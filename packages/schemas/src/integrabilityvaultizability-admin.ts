import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const integrabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type IntegrabilityvaultizabilityAdminDomain = z.infer<typeof integrabilityvaultizabilityAdminDomainSchema>

export const integrabilityvaultizabilityAdminRecordSchema = z.object({
  domain: integrabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IntegrabilityvaultizabilityAdminRecord = z.infer<typeof integrabilityvaultizabilityAdminRecordSchema>

export const integrabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  integrabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type IntegrabilityvaultizabilityAdminStats = z.infer<typeof integrabilityvaultizabilityAdminStatsSchema>

export const integrabilityvaultizabilityAdminActionSchema = z.enum(['refresh_integrabilityvaultizability_summary'])
export type IntegrabilityvaultizabilityAdminAction = z.infer<typeof integrabilityvaultizabilityAdminActionSchema>

export const integrabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(integrabilityvaultizabilityAdminRecordSchema),
  stats: integrabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(integrabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IntegrabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof integrabilityvaultizabilityAdminSummaryResponseSchema
>

export const integrabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: integrabilityvaultizabilityAdminActionSchema,
})
export type IntegrabilityvaultizabilityAdminActionRequest = z.infer<
  typeof integrabilityvaultizabilityAdminActionRequestSchema
>

export const integrabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: integrabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: integrabilityvaultizabilityAdminStatsSchema.optional(),
})
export type IntegrabilityvaultizabilityAdminActionResponse = z.infer<
  typeof integrabilityvaultizabilityAdminActionResponseSchema
>
