import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const certificationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type CertificationizabilityAdminDomain = z.infer<typeof certificationizabilityAdminDomainSchema>

export const certificationizabilityAdminRecordSchema = z.object({
  domain: certificationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CertificationizabilityAdminRecord = z.infer<typeof certificationizabilityAdminRecordSchema>

export const certificationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  certificationizabilityPercent: z.number().min(0).max(100),
})
export type CertificationizabilityAdminStats = z.infer<typeof certificationizabilityAdminStatsSchema>

export const certificationizabilityAdminActionSchema = z.enum(['refresh_certificationizability_summary'])
export type CertificationizabilityAdminAction = z.infer<typeof certificationizabilityAdminActionSchema>

export const certificationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(certificationizabilityAdminRecordSchema),
  stats: certificationizabilityAdminStatsSchema,
  availableActions: z.array(certificationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CertificationizabilityAdminSummaryResponse = z.infer<
  typeof certificationizabilityAdminSummaryResponseSchema
>

export const certificationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: certificationizabilityAdminActionSchema,
})
export type CertificationizabilityAdminActionRequest = z.infer<
  typeof certificationizabilityAdminActionRequestSchema
>

export const certificationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: certificationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: certificationizabilityAdminStatsSchema.optional(),
})
export type CertificationizabilityAdminActionResponse = z.infer<
  typeof certificationizabilityAdminActionResponseSchema
>
