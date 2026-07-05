import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const readabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'agent_outputs',
])
export type ReadabilityAdminDomain = z.infer<typeof readabilityAdminDomainSchema>

export const readabilityAdminRecordSchema = z.object({
  domain: readabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReadabilityAdminRecord = z.infer<typeof readabilityAdminRecordSchema>

export const readabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  readabilityPercent: z.number().min(0).max(100),
})
export type ReadabilityAdminStats = z.infer<typeof readabilityAdminStatsSchema>

export const readabilityAdminActionSchema = z.enum(['refresh_readability_summary'])
export type ReadabilityAdminAction = z.infer<typeof readabilityAdminActionSchema>

export const readabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(readabilityAdminRecordSchema),
  stats: readabilityAdminStatsSchema,
  availableActions: z.array(readabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReadabilityAdminSummaryResponse = z.infer<
  typeof readabilityAdminSummaryResponseSchema
>

export const readabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: readabilityAdminActionSchema,
})
export type ReadabilityAdminActionRequest = z.infer<
  typeof readabilityAdminActionRequestSchema
>

export const readabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: readabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: readabilityAdminStatsSchema.optional(),
})
export type ReadabilityAdminActionResponse = z.infer<
  typeof readabilityAdminActionResponseSchema
>
