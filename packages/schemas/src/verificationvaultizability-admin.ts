import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const verificationvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type VerificationvaultizabilityAdminDomain = z.infer<typeof verificationvaultizabilityAdminDomainSchema>

export const verificationvaultizabilityAdminRecordSchema = z.object({
  domain: verificationvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type VerificationvaultizabilityAdminRecord = z.infer<typeof verificationvaultizabilityAdminRecordSchema>

export const verificationvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  verificationvaultizabilityPercent: z.number().min(0).max(100),
})
export type VerificationvaultizabilityAdminStats = z.infer<typeof verificationvaultizabilityAdminStatsSchema>

export const verificationvaultizabilityAdminActionSchema = z.enum(['refresh_verificationvaultizability_summary'])
export type VerificationvaultizabilityAdminAction = z.infer<typeof verificationvaultizabilityAdminActionSchema>

export const verificationvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(verificationvaultizabilityAdminRecordSchema),
  stats: verificationvaultizabilityAdminStatsSchema,
  availableActions: z.array(verificationvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type VerificationvaultizabilityAdminSummaryResponse = z.infer<
  typeof verificationvaultizabilityAdminSummaryResponseSchema
>

export const verificationvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: verificationvaultizabilityAdminActionSchema,
})
export type VerificationvaultizabilityAdminActionRequest = z.infer<
  typeof verificationvaultizabilityAdminActionRequestSchema
>

export const verificationvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: verificationvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: verificationvaultizabilityAdminStatsSchema.optional(),
})
export type VerificationvaultizabilityAdminActionResponse = z.infer<
  typeof verificationvaultizabilityAdminActionResponseSchema
>
