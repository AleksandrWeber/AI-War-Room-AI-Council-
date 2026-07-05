import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const attestationAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'provider_credentials',
  'model_registry_entries',
])
export type AttestationAdminDomain = z.infer<typeof attestationAdminDomainSchema>

export const attestationAdminRecordSchema = z.object({
  domain: attestationAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AttestationAdminRecord = z.infer<typeof attestationAdminRecordSchema>

export const attestationAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  attestationPercent: z.number().min(0).max(100),
})
export type AttestationAdminStats = z.infer<typeof attestationAdminStatsSchema>

export const attestationAdminActionSchema = z.enum(['refresh_attestation_summary'])
export type AttestationAdminAction = z.infer<typeof attestationAdminActionSchema>

export const attestationAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(attestationAdminRecordSchema),
  stats: attestationAdminStatsSchema,
  availableActions: z.array(attestationAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AttestationAdminSummaryResponse = z.infer<
  typeof attestationAdminSummaryResponseSchema
>

export const attestationAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attestationAdminActionSchema,
})
export type AttestationAdminActionRequest = z.infer<
  typeof attestationAdminActionRequestSchema
>

export const attestationAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attestationAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: attestationAdminStatsSchema.optional(),
})
export type AttestationAdminActionResponse = z.infer<
  typeof attestationAdminActionResponseSchema
>
