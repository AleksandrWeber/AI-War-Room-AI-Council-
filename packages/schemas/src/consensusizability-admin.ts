import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const consensusizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type ConsensusizabilityAdminDomain = z.infer<typeof consensusizabilityAdminDomainSchema>

export const consensusizabilityAdminRecordSchema = z.object({
  domain: consensusizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConsensusizabilityAdminRecord = z.infer<typeof consensusizabilityAdminRecordSchema>

export const consensusizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  consensusizabilityPercent: z.number().min(0).max(100),
})
export type ConsensusizabilityAdminStats = z.infer<typeof consensusizabilityAdminStatsSchema>

export const consensusizabilityAdminActionSchema = z.enum(['refresh_consensusizability_summary'])
export type ConsensusizabilityAdminAction = z.infer<typeof consensusizabilityAdminActionSchema>

export const consensusizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(consensusizabilityAdminRecordSchema),
  stats: consensusizabilityAdminStatsSchema,
  availableActions: z.array(consensusizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConsensusizabilityAdminSummaryResponse = z.infer<
  typeof consensusizabilityAdminSummaryResponseSchema
>

export const consensusizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: consensusizabilityAdminActionSchema,
})
export type ConsensusizabilityAdminActionRequest = z.infer<
  typeof consensusizabilityAdminActionRequestSchema
>

export const consensusizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: consensusizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: consensusizabilityAdminStatsSchema.optional(),
})
export type ConsensusizabilityAdminActionResponse = z.infer<
  typeof consensusizabilityAdminActionResponseSchema
>
