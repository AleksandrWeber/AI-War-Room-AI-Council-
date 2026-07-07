import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const credibilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type CredibilityvaultizabilityAdminDomain = z.infer<typeof credibilityvaultizabilityAdminDomainSchema>

export const credibilityvaultizabilityAdminRecordSchema = z.object({
  domain: credibilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CredibilityvaultizabilityAdminRecord = z.infer<typeof credibilityvaultizabilityAdminRecordSchema>

export const credibilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  credibilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type CredibilityvaultizabilityAdminStats = z.infer<typeof credibilityvaultizabilityAdminStatsSchema>

export const credibilityvaultizabilityAdminActionSchema = z.enum(['refresh_credibilityvaultizability_summary'])
export type CredibilityvaultizabilityAdminAction = z.infer<typeof credibilityvaultizabilityAdminActionSchema>

export const credibilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(credibilityvaultizabilityAdminRecordSchema),
  stats: credibilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(credibilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CredibilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof credibilityvaultizabilityAdminSummaryResponseSchema
>

export const credibilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: credibilityvaultizabilityAdminActionSchema,
})
export type CredibilityvaultizabilityAdminActionRequest = z.infer<
  typeof credibilityvaultizabilityAdminActionRequestSchema
>

export const credibilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: credibilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: credibilityvaultizabilityAdminStatsSchema.optional(),
})
export type CredibilityvaultizabilityAdminActionResponse = z.infer<
  typeof credibilityvaultizabilityAdminActionResponseSchema
>
