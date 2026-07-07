import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const attestationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type AttestationizabilityAdminDomain = z.infer<typeof attestationizabilityAdminDomainSchema>

export const attestationizabilityAdminRecordSchema = z.object({
  domain: attestationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AttestationizabilityAdminRecord = z.infer<typeof attestationizabilityAdminRecordSchema>

export const attestationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  attestationizabilityPercent: z.number().min(0).max(100),
})
export type AttestationizabilityAdminStats = z.infer<typeof attestationizabilityAdminStatsSchema>

export const attestationizabilityAdminActionSchema = z.enum(['refresh_attestationizability_summary'])
export type AttestationizabilityAdminAction = z.infer<typeof attestationizabilityAdminActionSchema>

export const attestationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(attestationizabilityAdminRecordSchema),
  stats: attestationizabilityAdminStatsSchema,
  availableActions: z.array(attestationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AttestationizabilityAdminSummaryResponse = z.infer<
  typeof attestationizabilityAdminSummaryResponseSchema
>

export const attestationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attestationizabilityAdminActionSchema,
})
export type AttestationizabilityAdminActionRequest = z.infer<
  typeof attestationizabilityAdminActionRequestSchema
>

export const attestationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attestationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: attestationizabilityAdminStatsSchema.optional(),
})
export type AttestationizabilityAdminActionResponse = z.infer<
  typeof attestationizabilityAdminActionResponseSchema
>
