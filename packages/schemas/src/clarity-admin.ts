import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const clarityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'moderator_syntheses',
  'agent_outputs',
])
export type ClarityAdminDomain = z.infer<typeof clarityAdminDomainSchema>

export const clarityAdminRecordSchema = z.object({
  domain: clarityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ClarityAdminRecord = z.infer<typeof clarityAdminRecordSchema>

export const clarityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  clarityPercent: z.number().min(0).max(100),
})
export type ClarityAdminStats = z.infer<typeof clarityAdminStatsSchema>

export const clarityAdminActionSchema = z.enum(['refresh_clarity_summary'])
export type ClarityAdminAction = z.infer<typeof clarityAdminActionSchema>

export const clarityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(clarityAdminRecordSchema),
  stats: clarityAdminStatsSchema,
  availableActions: z.array(clarityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ClarityAdminSummaryResponse = z.infer<
  typeof clarityAdminSummaryResponseSchema
>

export const clarityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: clarityAdminActionSchema,
})
export type ClarityAdminActionRequest = z.infer<
  typeof clarityAdminActionRequestSchema
>

export const clarityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: clarityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: clarityAdminStatsSchema.optional(),
})
export type ClarityAdminActionResponse = z.infer<
  typeof clarityAdminActionResponseSchema
>
