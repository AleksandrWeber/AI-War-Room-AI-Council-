import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const integrabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'workspace_memberships',
])
export type IntegrabilityAdminDomain = z.infer<typeof integrabilityAdminDomainSchema>

export const integrabilityAdminRecordSchema = z.object({
  domain: integrabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IntegrabilityAdminRecord = z.infer<typeof integrabilityAdminRecordSchema>

export const integrabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  integrabilityPercent: z.number().min(0).max(100),
})
export type IntegrabilityAdminStats = z.infer<typeof integrabilityAdminStatsSchema>

export const integrabilityAdminActionSchema = z.enum(['refresh_integrability_summary'])
export type IntegrabilityAdminAction = z.infer<typeof integrabilityAdminActionSchema>

export const integrabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(integrabilityAdminRecordSchema),
  stats: integrabilityAdminStatsSchema,
  availableActions: z.array(integrabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IntegrabilityAdminSummaryResponse = z.infer<
  typeof integrabilityAdminSummaryResponseSchema
>

export const integrabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: integrabilityAdminActionSchema,
})
export type IntegrabilityAdminActionRequest = z.infer<
  typeof integrabilityAdminActionRequestSchema
>

export const integrabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: integrabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: integrabilityAdminStatsSchema.optional(),
})
export type IntegrabilityAdminActionResponse = z.infer<
  typeof integrabilityAdminActionResponseSchema
>
