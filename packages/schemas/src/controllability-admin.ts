import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const controllabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ControllabilityAdminDomain = z.infer<typeof controllabilityAdminDomainSchema>

export const controllabilityAdminRecordSchema = z.object({
  domain: controllabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ControllabilityAdminRecord = z.infer<typeof controllabilityAdminRecordSchema>

export const controllabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  controllabilityPercent: z.number().min(0).max(100),
})
export type ControllabilityAdminStats = z.infer<typeof controllabilityAdminStatsSchema>

export const controllabilityAdminActionSchema = z.enum(['refresh_controllability_summary'])
export type ControllabilityAdminAction = z.infer<typeof controllabilityAdminActionSchema>

export const controllabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(controllabilityAdminRecordSchema),
  stats: controllabilityAdminStatsSchema,
  availableActions: z.array(controllabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ControllabilityAdminSummaryResponse = z.infer<
  typeof controllabilityAdminSummaryResponseSchema
>

export const controllabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: controllabilityAdminActionSchema,
})
export type ControllabilityAdminActionRequest = z.infer<
  typeof controllabilityAdminActionRequestSchema
>

export const controllabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: controllabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: controllabilityAdminStatsSchema.optional(),
})
export type ControllabilityAdminActionResponse = z.infer<
  typeof controllabilityAdminActionResponseSchema
>
