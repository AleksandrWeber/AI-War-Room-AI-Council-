import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const authenticityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'moderator_syntheses',
  'artifacts',
])
export type AuthenticityAdminDomain = z.infer<typeof authenticityAdminDomainSchema>

export const authenticityAdminRecordSchema = z.object({
  domain: authenticityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AuthenticityAdminRecord = z.infer<typeof authenticityAdminRecordSchema>

export const authenticityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  authenticityPercent: z.number().min(0).max(100),
})
export type AuthenticityAdminStats = z.infer<typeof authenticityAdminStatsSchema>

export const authenticityAdminActionSchema = z.enum(['refresh_authenticity_summary'])
export type AuthenticityAdminAction = z.infer<typeof authenticityAdminActionSchema>

export const authenticityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(authenticityAdminRecordSchema),
  stats: authenticityAdminStatsSchema,
  availableActions: z.array(authenticityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AuthenticityAdminSummaryResponse = z.infer<
  typeof authenticityAdminSummaryResponseSchema
>

export const authenticityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: authenticityAdminActionSchema,
})
export type AuthenticityAdminActionRequest = z.infer<
  typeof authenticityAdminActionRequestSchema
>

export const authenticityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: authenticityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: authenticityAdminStatsSchema.optional(),
})
export type AuthenticityAdminActionResponse = z.infer<
  typeof authenticityAdminActionResponseSchema
>
