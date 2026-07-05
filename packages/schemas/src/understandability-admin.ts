import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const understandabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'moderator_syntheses',
  'agent_outputs',
])
export type UnderstandabilityAdminDomain = z.infer<typeof understandabilityAdminDomainSchema>

export const understandabilityAdminRecordSchema = z.object({
  domain: understandabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type UnderstandabilityAdminRecord = z.infer<typeof understandabilityAdminRecordSchema>

export const understandabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  understandabilityPercent: z.number().min(0).max(100),
})
export type UnderstandabilityAdminStats = z.infer<typeof understandabilityAdminStatsSchema>

export const understandabilityAdminActionSchema = z.enum(['refresh_understandability_summary'])
export type UnderstandabilityAdminAction = z.infer<typeof understandabilityAdminActionSchema>

export const understandabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(understandabilityAdminRecordSchema),
  stats: understandabilityAdminStatsSchema,
  availableActions: z.array(understandabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type UnderstandabilityAdminSummaryResponse = z.infer<
  typeof understandabilityAdminSummaryResponseSchema
>

export const understandabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: understandabilityAdminActionSchema,
})
export type UnderstandabilityAdminActionRequest = z.infer<
  typeof understandabilityAdminActionRequestSchema
>

export const understandabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: understandabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: understandabilityAdminStatsSchema.optional(),
})
export type UnderstandabilityAdminActionResponse = z.infer<
  typeof understandabilityAdminActionResponseSchema
>
