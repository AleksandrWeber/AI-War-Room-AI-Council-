import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const attestledgerizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type AttestledgerizabilityAdminDomain = z.infer<typeof attestledgerizabilityAdminDomainSchema>

export const attestledgerizabilityAdminRecordSchema = z.object({
  domain: attestledgerizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AttestledgerizabilityAdminRecord = z.infer<typeof attestledgerizabilityAdminRecordSchema>

export const attestledgerizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  attestledgerizabilityPercent: z.number().min(0).max(100),
})
export type AttestledgerizabilityAdminStats = z.infer<typeof attestledgerizabilityAdminStatsSchema>

export const attestledgerizabilityAdminActionSchema = z.enum(['refresh_attestledgerizability_summary'])
export type AttestledgerizabilityAdminAction = z.infer<typeof attestledgerizabilityAdminActionSchema>

export const attestledgerizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(attestledgerizabilityAdminRecordSchema),
  stats: attestledgerizabilityAdminStatsSchema,
  availableActions: z.array(attestledgerizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AttestledgerizabilityAdminSummaryResponse = z.infer<
  typeof attestledgerizabilityAdminSummaryResponseSchema
>

export const attestledgerizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attestledgerizabilityAdminActionSchema,
})
export type AttestledgerizabilityAdminActionRequest = z.infer<
  typeof attestledgerizabilityAdminActionRequestSchema
>

export const attestledgerizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: attestledgerizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: attestledgerizabilityAdminStatsSchema.optional(),
})
export type AttestledgerizabilityAdminActionResponse = z.infer<
  typeof attestledgerizabilityAdminActionResponseSchema
>
