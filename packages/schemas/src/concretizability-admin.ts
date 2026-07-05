import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const concretizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ConcretizabilityAdminDomain = z.infer<typeof concretizabilityAdminDomainSchema>

export const concretizabilityAdminRecordSchema = z.object({
  domain: concretizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConcretizabilityAdminRecord = z.infer<typeof concretizabilityAdminRecordSchema>

export const concretizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  concretizabilityPercent: z.number().min(0).max(100),
})
export type ConcretizabilityAdminStats = z.infer<typeof concretizabilityAdminStatsSchema>

export const concretizabilityAdminActionSchema = z.enum(['refresh_concretizability_summary'])
export type ConcretizabilityAdminAction = z.infer<typeof concretizabilityAdminActionSchema>

export const concretizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(concretizabilityAdminRecordSchema),
  stats: concretizabilityAdminStatsSchema,
  availableActions: z.array(concretizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConcretizabilityAdminSummaryResponse = z.infer<
  typeof concretizabilityAdminSummaryResponseSchema
>

export const concretizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: concretizabilityAdminActionSchema,
})
export type ConcretizabilityAdminActionRequest = z.infer<
  typeof concretizabilityAdminActionRequestSchema
>

export const concretizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: concretizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: concretizabilityAdminStatsSchema.optional(),
})
export type ConcretizabilityAdminActionResponse = z.infer<
  typeof concretizabilityAdminActionResponseSchema
>
