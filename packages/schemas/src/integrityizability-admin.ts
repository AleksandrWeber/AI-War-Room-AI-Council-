import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const integrityizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type IntegrityizabilityAdminDomain = z.infer<typeof integrityizabilityAdminDomainSchema>

export const integrityizabilityAdminRecordSchema = z.object({
  domain: integrityizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IntegrityizabilityAdminRecord = z.infer<typeof integrityizabilityAdminRecordSchema>

export const integrityizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  integrityizabilityPercent: z.number().min(0).max(100),
})
export type IntegrityizabilityAdminStats = z.infer<typeof integrityizabilityAdminStatsSchema>

export const integrityizabilityAdminActionSchema = z.enum(['refresh_integrityizability_summary'])
export type IntegrityizabilityAdminAction = z.infer<typeof integrityizabilityAdminActionSchema>

export const integrityizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(integrityizabilityAdminRecordSchema),
  stats: integrityizabilityAdminStatsSchema,
  availableActions: z.array(integrityizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IntegrityizabilityAdminSummaryResponse = z.infer<
  typeof integrityizabilityAdminSummaryResponseSchema
>

export const integrityizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: integrityizabilityAdminActionSchema,
})
export type IntegrityizabilityAdminActionRequest = z.infer<
  typeof integrityizabilityAdminActionRequestSchema
>

export const integrityizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: integrityizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: integrityizabilityAdminStatsSchema.optional(),
})
export type IntegrityizabilityAdminActionResponse = z.infer<
  typeof integrityizabilityAdminActionResponseSchema
>
