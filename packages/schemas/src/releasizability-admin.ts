import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const releasizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type ReleasizabilityAdminDomain = z.infer<typeof releasizabilityAdminDomainSchema>

export const releasizabilityAdminRecordSchema = z.object({
  domain: releasizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReleasizabilityAdminRecord = z.infer<typeof releasizabilityAdminRecordSchema>

export const releasizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  releasizabilityPercent: z.number().min(0).max(100),
})
export type ReleasizabilityAdminStats = z.infer<typeof releasizabilityAdminStatsSchema>

export const releasizabilityAdminActionSchema = z.enum(['refresh_releasizability_summary'])
export type ReleasizabilityAdminAction = z.infer<typeof releasizabilityAdminActionSchema>

export const releasizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(releasizabilityAdminRecordSchema),
  stats: releasizabilityAdminStatsSchema,
  availableActions: z.array(releasizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReleasizabilityAdminSummaryResponse = z.infer<
  typeof releasizabilityAdminSummaryResponseSchema
>

export const releasizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: releasizabilityAdminActionSchema,
})
export type ReleasizabilityAdminActionRequest = z.infer<
  typeof releasizabilityAdminActionRequestSchema
>

export const releasizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: releasizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: releasizabilityAdminStatsSchema.optional(),
})
export type ReleasizabilityAdminActionResponse = z.infer<
  typeof releasizabilityAdminActionResponseSchema
>
