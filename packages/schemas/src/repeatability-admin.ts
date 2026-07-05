import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const repeatabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'run_workflows',
])
export type RepeatabilityAdminDomain = z.infer<typeof repeatabilityAdminDomainSchema>

export const repeatabilityAdminRecordSchema = z.object({
  domain: repeatabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RepeatabilityAdminRecord = z.infer<typeof repeatabilityAdminRecordSchema>

export const repeatabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  repeatabilityPercent: z.number().min(0).max(100),
})
export type RepeatabilityAdminStats = z.infer<typeof repeatabilityAdminStatsSchema>

export const repeatabilityAdminActionSchema = z.enum(['refresh_repeatability_summary'])
export type RepeatabilityAdminAction = z.infer<typeof repeatabilityAdminActionSchema>

export const repeatabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(repeatabilityAdminRecordSchema),
  stats: repeatabilityAdminStatsSchema,
  availableActions: z.array(repeatabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RepeatabilityAdminSummaryResponse = z.infer<
  typeof repeatabilityAdminSummaryResponseSchema
>

export const repeatabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: repeatabilityAdminActionSchema,
})
export type RepeatabilityAdminActionRequest = z.infer<
  typeof repeatabilityAdminActionRequestSchema
>

export const repeatabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: repeatabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: repeatabilityAdminStatsSchema.optional(),
})
export type RepeatabilityAdminActionResponse = z.infer<
  typeof repeatabilityAdminActionResponseSchema
>
