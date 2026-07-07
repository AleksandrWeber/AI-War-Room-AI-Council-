import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const witnessizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type WitnessizabilityAdminDomain = z.infer<typeof witnessizabilityAdminDomainSchema>

export const witnessizabilityAdminRecordSchema = z.object({
  domain: witnessizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type WitnessizabilityAdminRecord = z.infer<typeof witnessizabilityAdminRecordSchema>

export const witnessizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  witnessizabilityPercent: z.number().min(0).max(100),
})
export type WitnessizabilityAdminStats = z.infer<typeof witnessizabilityAdminStatsSchema>

export const witnessizabilityAdminActionSchema = z.enum(['refresh_witnessizability_summary'])
export type WitnessizabilityAdminAction = z.infer<typeof witnessizabilityAdminActionSchema>

export const witnessizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(witnessizabilityAdminRecordSchema),
  stats: witnessizabilityAdminStatsSchema,
  availableActions: z.array(witnessizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type WitnessizabilityAdminSummaryResponse = z.infer<
  typeof witnessizabilityAdminSummaryResponseSchema
>

export const witnessizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: witnessizabilityAdminActionSchema,
})
export type WitnessizabilityAdminActionRequest = z.infer<
  typeof witnessizabilityAdminActionRequestSchema
>

export const witnessizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: witnessizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: witnessizabilityAdminStatsSchema.optional(),
})
export type WitnessizabilityAdminActionResponse = z.infer<
  typeof witnessizabilityAdminActionResponseSchema
>
