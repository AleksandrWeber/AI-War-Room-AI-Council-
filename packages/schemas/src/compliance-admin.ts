import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const complianceAdminDomainSchema = z.enum([
  'shield_reviews',
  'provider_credentials',
  'billing_records',
  'usage_attestation',
])
export type ComplianceAdminDomain = z.infer<typeof complianceAdminDomainSchema>

export const complianceAdminRecordSchema = z.object({
  domain: complianceAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ComplianceAdminRecord = z.infer<typeof complianceAdminRecordSchema>

export const complianceAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  encryptionKeyConfigured: z.boolean(),
})
export type ComplianceAdminStats = z.infer<typeof complianceAdminStatsSchema>

export const complianceAdminActionSchema = z.enum(['refresh_compliance_summary'])
export type ComplianceAdminAction = z.infer<typeof complianceAdminActionSchema>

export const complianceAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(complianceAdminRecordSchema),
  stats: complianceAdminStatsSchema,
  availableActions: z.array(complianceAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ComplianceAdminSummaryResponse = z.infer<
  typeof complianceAdminSummaryResponseSchema
>

export const complianceAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: complianceAdminActionSchema,
})
export type ComplianceAdminActionRequest = z.infer<
  typeof complianceAdminActionRequestSchema
>

export const complianceAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: complianceAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: complianceAdminStatsSchema.optional(),
})
export type ComplianceAdminActionResponse = z.infer<
  typeof complianceAdminActionResponseSchema
>
