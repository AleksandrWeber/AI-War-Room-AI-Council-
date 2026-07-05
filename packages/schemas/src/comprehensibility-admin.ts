import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const comprehensibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'agent_outputs',
  'moderator_syntheses',
])
export type ComprehensibilityAdminDomain = z.infer<typeof comprehensibilityAdminDomainSchema>

export const comprehensibilityAdminRecordSchema = z.object({
  domain: comprehensibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ComprehensibilityAdminRecord = z.infer<typeof comprehensibilityAdminRecordSchema>

export const comprehensibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  comprehensibilityPercent: z.number().min(0).max(100),
})
export type ComprehensibilityAdminStats = z.infer<typeof comprehensibilityAdminStatsSchema>

export const comprehensibilityAdminActionSchema = z.enum(['refresh_comprehensibility_summary'])
export type ComprehensibilityAdminAction = z.infer<typeof comprehensibilityAdminActionSchema>

export const comprehensibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(comprehensibilityAdminRecordSchema),
  stats: comprehensibilityAdminStatsSchema,
  availableActions: z.array(comprehensibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ComprehensibilityAdminSummaryResponse = z.infer<
  typeof comprehensibilityAdminSummaryResponseSchema
>

export const comprehensibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: comprehensibilityAdminActionSchema,
})
export type ComprehensibilityAdminActionRequest = z.infer<
  typeof comprehensibilityAdminActionRequestSchema
>

export const comprehensibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: comprehensibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: comprehensibilityAdminStatsSchema.optional(),
})
export type ComprehensibilityAdminActionResponse = z.infer<
  typeof comprehensibilityAdminActionResponseSchema
>
