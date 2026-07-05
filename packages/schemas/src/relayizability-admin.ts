import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const relayizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type RelayizabilityAdminDomain = z.infer<typeof relayizabilityAdminDomainSchema>

export const relayizabilityAdminRecordSchema = z.object({
  domain: relayizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RelayizabilityAdminRecord = z.infer<typeof relayizabilityAdminRecordSchema>

export const relayizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  relayizabilityPercent: z.number().min(0).max(100),
})
export type RelayizabilityAdminStats = z.infer<typeof relayizabilityAdminStatsSchema>

export const relayizabilityAdminActionSchema = z.enum(['refresh_relayizability_summary'])
export type RelayizabilityAdminAction = z.infer<typeof relayizabilityAdminActionSchema>

export const relayizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(relayizabilityAdminRecordSchema),
  stats: relayizabilityAdminStatsSchema,
  availableActions: z.array(relayizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RelayizabilityAdminSummaryResponse = z.infer<
  typeof relayizabilityAdminSummaryResponseSchema
>

export const relayizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: relayizabilityAdminActionSchema,
})
export type RelayizabilityAdminActionRequest = z.infer<
  typeof relayizabilityAdminActionRequestSchema
>

export const relayizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: relayizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: relayizabilityAdminStatsSchema.optional(),
})
export type RelayizabilityAdminActionResponse = z.infer<
  typeof relayizabilityAdminActionResponseSchema
>
