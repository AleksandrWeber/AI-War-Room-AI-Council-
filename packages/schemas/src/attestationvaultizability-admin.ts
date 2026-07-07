import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const attestationvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type AttestationvaultizabilityAdminDomain = z.infer<typeof attestationvaultizabilityAdminDomainSchema>

export const attestationvaultizabilityAdminRecordSchema = z.object({
  domain: attestationvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AttestationvaultizabilityAdminRecord = z.infer<typeof attestationvaultizabilityAdminRecordSchema>

export const attestationvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  attestationvaultizabilityPercent: z.number().min(0).max(100),
})
export type AttestationvaultizabilityAdminStats = z.infer<typeof attestationvaultizabilityAdminStatsSchema>

export const attestationvaultizabilityAdminActionSchema = z.enum(['refresh_attestationvaultizability_summary'])
export type AttestationvaultizabilityAdminAction = z.infer<typeof attestationvaultizabilityAdminActionSchema>

export const attestationvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(attestationvaultizabilityAdminRecordSchema),
  stats: attestationvaultizabilityAdminStatsSchema,
  availableActions: z.array(attestationvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AttestationvaultizabilityAdminSummaryResponse = z.infer<
  typeof attestationvaultizabilityAdminSummaryResponseSchema
>

export const attestationvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attestationvaultizabilityAdminActionSchema,
})
export type AttestationvaultizabilityAdminActionRequest = z.infer<
  typeof attestationvaultizabilityAdminActionRequestSchema
>

export const attestationvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attestationvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: attestationvaultizabilityAdminStatsSchema.optional(),
})
export type AttestationvaultizabilityAdminActionResponse = z.infer<
  typeof attestationvaultizabilityAdminActionResponseSchema
>
