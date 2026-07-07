import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const certifiabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type CertifiabilityvaultizabilityAdminDomain = z.infer<typeof certifiabilityvaultizabilityAdminDomainSchema>

export const certifiabilityvaultizabilityAdminRecordSchema = z.object({
  domain: certifiabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CertifiabilityvaultizabilityAdminRecord = z.infer<typeof certifiabilityvaultizabilityAdminRecordSchema>

export const certifiabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  certifiabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type CertifiabilityvaultizabilityAdminStats = z.infer<typeof certifiabilityvaultizabilityAdminStatsSchema>

export const certifiabilityvaultizabilityAdminActionSchema = z.enum(['refresh_certifiabilityvaultizability_summary'])
export type CertifiabilityvaultizabilityAdminAction = z.infer<typeof certifiabilityvaultizabilityAdminActionSchema>

export const certifiabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(certifiabilityvaultizabilityAdminRecordSchema),
  stats: certifiabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(certifiabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CertifiabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof certifiabilityvaultizabilityAdminSummaryResponseSchema
>

export const certifiabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: certifiabilityvaultizabilityAdminActionSchema,
})
export type CertifiabilityvaultizabilityAdminActionRequest = z.infer<
  typeof certifiabilityvaultizabilityAdminActionRequestSchema
>

export const certifiabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: certifiabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: certifiabilityvaultizabilityAdminStatsSchema.optional(),
})
export type CertifiabilityvaultizabilityAdminActionResponse = z.infer<
  typeof certifiabilityvaultizabilityAdminActionResponseSchema
>
