import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const cryptographyizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type CryptographyizabilityAdminDomain = z.infer<typeof cryptographyizabilityAdminDomainSchema>

export const cryptographyizabilityAdminRecordSchema = z.object({
  domain: cryptographyizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CryptographyizabilityAdminRecord = z.infer<typeof cryptographyizabilityAdminRecordSchema>

export const cryptographyizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  cryptographyizabilityPercent: z.number().min(0).max(100),
})
export type CryptographyizabilityAdminStats = z.infer<typeof cryptographyizabilityAdminStatsSchema>

export const cryptographyizabilityAdminActionSchema = z.enum(['refresh_cryptographyizability_summary'])
export type CryptographyizabilityAdminAction = z.infer<typeof cryptographyizabilityAdminActionSchema>

export const cryptographyizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(cryptographyizabilityAdminRecordSchema),
  stats: cryptographyizabilityAdminStatsSchema,
  availableActions: z.array(cryptographyizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CryptographyizabilityAdminSummaryResponse = z.infer<
  typeof cryptographyizabilityAdminSummaryResponseSchema
>

export const cryptographyizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: cryptographyizabilityAdminActionSchema,
})
export type CryptographyizabilityAdminActionRequest = z.infer<
  typeof cryptographyizabilityAdminActionRequestSchema
>

export const cryptographyizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: cryptographyizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: cryptographyizabilityAdminStatsSchema.optional(),
})
export type CryptographyizabilityAdminActionResponse = z.infer<
  typeof cryptographyizabilityAdminActionResponseSchema
>
