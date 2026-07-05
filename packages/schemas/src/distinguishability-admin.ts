import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const distinguishabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'moderator_syntheses',
  'run_workflows',
])
export type DistinguishabilityAdminDomain = z.infer<typeof distinguishabilityAdminDomainSchema>

export const distinguishabilityAdminRecordSchema = z.object({
  domain: distinguishabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DistinguishabilityAdminRecord = z.infer<typeof distinguishabilityAdminRecordSchema>

export const distinguishabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  distinguishabilityPercent: z.number().min(0).max(100),
})
export type DistinguishabilityAdminStats = z.infer<typeof distinguishabilityAdminStatsSchema>

export const distinguishabilityAdminActionSchema = z.enum(['refresh_distinguishability_summary'])
export type DistinguishabilityAdminAction = z.infer<typeof distinguishabilityAdminActionSchema>

export const distinguishabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(distinguishabilityAdminRecordSchema),
  stats: distinguishabilityAdminStatsSchema,
  availableActions: z.array(distinguishabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DistinguishabilityAdminSummaryResponse = z.infer<
  typeof distinguishabilityAdminSummaryResponseSchema
>

export const distinguishabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: distinguishabilityAdminActionSchema,
})
export type DistinguishabilityAdminActionRequest = z.infer<
  typeof distinguishabilityAdminActionRequestSchema
>

export const distinguishabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: distinguishabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: distinguishabilityAdminStatsSchema.optional(),
})
export type DistinguishabilityAdminActionResponse = z.infer<
  typeof distinguishabilityAdminActionResponseSchema
>
