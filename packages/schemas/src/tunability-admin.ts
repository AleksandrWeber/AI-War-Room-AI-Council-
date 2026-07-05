import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const tunabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'usage_events',
  'idempotency_keys',
])
export type TunabilityAdminDomain = z.infer<typeof tunabilityAdminDomainSchema>

export const tunabilityAdminRecordSchema = z.object({
  domain: tunabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TunabilityAdminRecord = z.infer<typeof tunabilityAdminRecordSchema>

export const tunabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  tunabilityPercent: z.number().min(0).max(100),
})
export type TunabilityAdminStats = z.infer<typeof tunabilityAdminStatsSchema>

export const tunabilityAdminActionSchema = z.enum(['refresh_tunability_summary'])
export type TunabilityAdminAction = z.infer<typeof tunabilityAdminActionSchema>

export const tunabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(tunabilityAdminRecordSchema),
  stats: tunabilityAdminStatsSchema,
  availableActions: z.array(tunabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TunabilityAdminSummaryResponse = z.infer<
  typeof tunabilityAdminSummaryResponseSchema
>

export const tunabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tunabilityAdminActionSchema,
})
export type TunabilityAdminActionRequest = z.infer<
  typeof tunabilityAdminActionRequestSchema
>

export const tunabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tunabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: tunabilityAdminStatsSchema.optional(),
})
export type TunabilityAdminActionResponse = z.infer<
  typeof tunabilityAdminActionResponseSchema
>
