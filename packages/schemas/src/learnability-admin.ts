import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const learnabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'agent_outputs',
  'artifacts',
])
export type LearnabilityAdminDomain = z.infer<typeof learnabilityAdminDomainSchema>

export const learnabilityAdminRecordSchema = z.object({
  domain: learnabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type LearnabilityAdminRecord = z.infer<typeof learnabilityAdminRecordSchema>

export const learnabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  learnabilityPercent: z.number().min(0).max(100),
})
export type LearnabilityAdminStats = z.infer<typeof learnabilityAdminStatsSchema>

export const learnabilityAdminActionSchema = z.enum(['refresh_learnability_summary'])
export type LearnabilityAdminAction = z.infer<typeof learnabilityAdminActionSchema>

export const learnabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(learnabilityAdminRecordSchema),
  stats: learnabilityAdminStatsSchema,
  availableActions: z.array(learnabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type LearnabilityAdminSummaryResponse = z.infer<
  typeof learnabilityAdminSummaryResponseSchema
>

export const learnabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: learnabilityAdminActionSchema,
})
export type LearnabilityAdminActionRequest = z.infer<
  typeof learnabilityAdminActionRequestSchema
>

export const learnabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: learnabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: learnabilityAdminStatsSchema.optional(),
})
export type LearnabilityAdminActionResponse = z.infer<
  typeof learnabilityAdminActionResponseSchema
>
