import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const quorumizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type QuorumizabilityAdminDomain = z.infer<typeof quorumizabilityAdminDomainSchema>

export const quorumizabilityAdminRecordSchema = z.object({
  domain: quorumizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type QuorumizabilityAdminRecord = z.infer<typeof quorumizabilityAdminRecordSchema>

export const quorumizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  quorumizabilityPercent: z.number().min(0).max(100),
})
export type QuorumizabilityAdminStats = z.infer<typeof quorumizabilityAdminStatsSchema>

export const quorumizabilityAdminActionSchema = z.enum(['refresh_quorumizability_summary'])
export type QuorumizabilityAdminAction = z.infer<typeof quorumizabilityAdminActionSchema>

export const quorumizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(quorumizabilityAdminRecordSchema),
  stats: quorumizabilityAdminStatsSchema,
  availableActions: z.array(quorumizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type QuorumizabilityAdminSummaryResponse = z.infer<
  typeof quorumizabilityAdminSummaryResponseSchema
>

export const quorumizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: quorumizabilityAdminActionSchema,
})
export type QuorumizabilityAdminActionRequest = z.infer<
  typeof quorumizabilityAdminActionRequestSchema
>

export const quorumizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: quorumizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: quorumizabilityAdminStatsSchema.optional(),
})
export type QuorumizabilityAdminActionResponse = z.infer<
  typeof quorumizabilityAdminActionResponseSchema
>
