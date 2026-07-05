import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const governanceAdminDomainSchema = z.enum([
  'workspace_memberships',
  'provider_credentials',
  'shield_reviews',
  'billing_records',
])
export type GovernanceAdminDomain = z.infer<typeof governanceAdminDomainSchema>

export const governanceAdminRecordSchema = z.object({
  domain: governanceAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type GovernanceAdminRecord = z.infer<typeof governanceAdminRecordSchema>

export const governanceAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  governancePercent: z.number().min(0).max(100),
})
export type GovernanceAdminStats = z.infer<typeof governanceAdminStatsSchema>

export const governanceAdminActionSchema = z.enum([
  'refresh_governance_summary',
])
export type GovernanceAdminAction = z.infer<typeof governanceAdminActionSchema>

export const governanceAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(governanceAdminRecordSchema),
  stats: governanceAdminStatsSchema,
  availableActions: z.array(governanceAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type GovernanceAdminSummaryResponse = z.infer<
  typeof governanceAdminSummaryResponseSchema
>

export const governanceAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: governanceAdminActionSchema,
})
export type GovernanceAdminActionRequest = z.infer<
  typeof governanceAdminActionRequestSchema
>

export const governanceAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: governanceAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: governanceAdminStatsSchema.optional(),
})
export type GovernanceAdminActionResponse = z.infer<
  typeof governanceAdminActionResponseSchema
>
