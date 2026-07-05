import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const intelligibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'moderator_syntheses',
  'agent_outputs',
])
export type IntelligibilityAdminDomain = z.infer<typeof intelligibilityAdminDomainSchema>

export const intelligibilityAdminRecordSchema = z.object({
  domain: intelligibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IntelligibilityAdminRecord = z.infer<typeof intelligibilityAdminRecordSchema>

export const intelligibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  intelligibilityPercent: z.number().min(0).max(100),
})
export type IntelligibilityAdminStats = z.infer<typeof intelligibilityAdminStatsSchema>

export const intelligibilityAdminActionSchema = z.enum(['refresh_intelligibility_summary'])
export type IntelligibilityAdminAction = z.infer<typeof intelligibilityAdminActionSchema>

export const intelligibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(intelligibilityAdminRecordSchema),
  stats: intelligibilityAdminStatsSchema,
  availableActions: z.array(intelligibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IntelligibilityAdminSummaryResponse = z.infer<
  typeof intelligibilityAdminSummaryResponseSchema
>

export const intelligibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: intelligibilityAdminActionSchema,
})
export type IntelligibilityAdminActionRequest = z.infer<
  typeof intelligibilityAdminActionRequestSchema
>

export const intelligibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: intelligibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: intelligibilityAdminStatsSchema.optional(),
})
export type IntelligibilityAdminActionResponse = z.infer<
  typeof intelligibilityAdminActionResponseSchema
>
