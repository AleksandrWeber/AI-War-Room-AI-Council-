import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const trustizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type TrustizabilityAdminDomain = z.infer<typeof trustizabilityAdminDomainSchema>

export const trustizabilityAdminRecordSchema = z.object({
  domain: trustizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TrustizabilityAdminRecord = z.infer<typeof trustizabilityAdminRecordSchema>

export const trustizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  trustizabilityPercent: z.number().min(0).max(100),
})
export type TrustizabilityAdminStats = z.infer<typeof trustizabilityAdminStatsSchema>

export const trustizabilityAdminActionSchema = z.enum(['refresh_trustizability_summary'])
export type TrustizabilityAdminAction = z.infer<typeof trustizabilityAdminActionSchema>

export const trustizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(trustizabilityAdminRecordSchema),
  stats: trustizabilityAdminStatsSchema,
  availableActions: z.array(trustizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TrustizabilityAdminSummaryResponse = z.infer<
  typeof trustizabilityAdminSummaryResponseSchema
>

export const trustizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: trustizabilityAdminActionSchema,
})
export type TrustizabilityAdminActionRequest = z.infer<
  typeof trustizabilityAdminActionRequestSchema
>

export const trustizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: trustizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: trustizabilityAdminStatsSchema.optional(),
})
export type TrustizabilityAdminActionResponse = z.infer<
  typeof trustizabilityAdminActionResponseSchema
>
