import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const memorabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'run_workflows',
])
export type MemorabilityAdminDomain = z.infer<typeof memorabilityAdminDomainSchema>

export const memorabilityAdminRecordSchema = z.object({
  domain: memorabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MemorabilityAdminRecord = z.infer<typeof memorabilityAdminRecordSchema>

export const memorabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  memorabilityPercent: z.number().min(0).max(100),
})
export type MemorabilityAdminStats = z.infer<typeof memorabilityAdminStatsSchema>

export const memorabilityAdminActionSchema = z.enum(['refresh_memorability_summary'])
export type MemorabilityAdminAction = z.infer<typeof memorabilityAdminActionSchema>

export const memorabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(memorabilityAdminRecordSchema),
  stats: memorabilityAdminStatsSchema,
  availableActions: z.array(memorabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MemorabilityAdminSummaryResponse = z.infer<
  typeof memorabilityAdminSummaryResponseSchema
>

export const memorabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: memorabilityAdminActionSchema,
})
export type MemorabilityAdminActionRequest = z.infer<
  typeof memorabilityAdminActionRequestSchema
>

export const memorabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: memorabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: memorabilityAdminStatsSchema.optional(),
})
export type MemorabilityAdminActionResponse = z.infer<
  typeof memorabilityAdminActionResponseSchema
>
