import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const certifiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'billing_webhook_events',
])
export type CertifiabilityAdminDomain = z.infer<typeof certifiabilityAdminDomainSchema>

export const certifiabilityAdminRecordSchema = z.object({
  domain: certifiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CertifiabilityAdminRecord = z.infer<typeof certifiabilityAdminRecordSchema>

export const certifiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  certifiabilityPercent: z.number().min(0).max(100),
})
export type CertifiabilityAdminStats = z.infer<typeof certifiabilityAdminStatsSchema>

export const certifiabilityAdminActionSchema = z.enum(['refresh_certifiability_summary'])
export type CertifiabilityAdminAction = z.infer<typeof certifiabilityAdminActionSchema>

export const certifiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(certifiabilityAdminRecordSchema),
  stats: certifiabilityAdminStatsSchema,
  availableActions: z.array(certifiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CertifiabilityAdminSummaryResponse = z.infer<
  typeof certifiabilityAdminSummaryResponseSchema
>

export const certifiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: certifiabilityAdminActionSchema,
})
export type CertifiabilityAdminActionRequest = z.infer<
  typeof certifiabilityAdminActionRequestSchema
>

export const certifiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: certifiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: certifiabilityAdminStatsSchema.optional(),
})
export type CertifiabilityAdminActionResponse = z.infer<
  typeof certifiabilityAdminActionResponseSchema
>
