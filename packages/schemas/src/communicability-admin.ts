import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const communicabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'moderator_syntheses',
  'agent_outputs',
])
export type CommunicabilityAdminDomain = z.infer<typeof communicabilityAdminDomainSchema>

export const communicabilityAdminRecordSchema = z.object({
  domain: communicabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CommunicabilityAdminRecord = z.infer<typeof communicabilityAdminRecordSchema>

export const communicabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  communicabilityPercent: z.number().min(0).max(100),
})
export type CommunicabilityAdminStats = z.infer<typeof communicabilityAdminStatsSchema>

export const communicabilityAdminActionSchema = z.enum(['refresh_communicability_summary'])
export type CommunicabilityAdminAction = z.infer<typeof communicabilityAdminActionSchema>

export const communicabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(communicabilityAdminRecordSchema),
  stats: communicabilityAdminStatsSchema,
  availableActions: z.array(communicabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CommunicabilityAdminSummaryResponse = z.infer<
  typeof communicabilityAdminSummaryResponseSchema
>

export const communicabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: communicabilityAdminActionSchema,
})
export type CommunicabilityAdminActionRequest = z.infer<
  typeof communicabilityAdminActionRequestSchema
>

export const communicabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: communicabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: communicabilityAdminStatsSchema.optional(),
})
export type CommunicabilityAdminActionResponse = z.infer<
  typeof communicabilityAdminActionResponseSchema
>
