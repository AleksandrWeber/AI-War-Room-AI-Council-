import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const witnessproofizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type WitnessproofizabilityAdminDomain = z.infer<typeof witnessproofizabilityAdminDomainSchema>

export const witnessproofizabilityAdminRecordSchema = z.object({
  domain: witnessproofizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type WitnessproofizabilityAdminRecord = z.infer<typeof witnessproofizabilityAdminRecordSchema>

export const witnessproofizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  witnessproofizabilityPercent: z.number().min(0).max(100),
})
export type WitnessproofizabilityAdminStats = z.infer<typeof witnessproofizabilityAdminStatsSchema>

export const witnessproofizabilityAdminActionSchema = z.enum(['refresh_witnessproofizability_summary'])
export type WitnessproofizabilityAdminAction = z.infer<typeof witnessproofizabilityAdminActionSchema>

export const witnessproofizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(witnessproofizabilityAdminRecordSchema),
  stats: witnessproofizabilityAdminStatsSchema,
  availableActions: z.array(witnessproofizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type WitnessproofizabilityAdminSummaryResponse = z.infer<
  typeof witnessproofizabilityAdminSummaryResponseSchema
>

export const witnessproofizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: witnessproofizabilityAdminActionSchema,
})
export type WitnessproofizabilityAdminActionRequest = z.infer<
  typeof witnessproofizabilityAdminActionRequestSchema
>

export const witnessproofizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: witnessproofizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: witnessproofizabilityAdminStatsSchema.optional(),
})
export type WitnessproofizabilityAdminActionResponse = z.infer<
  typeof witnessproofizabilityAdminActionResponseSchema
>
