import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const mirroringizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type MirroringizabilityAdminDomain = z.infer<typeof mirroringizabilityAdminDomainSchema>

export const mirroringizabilityAdminRecordSchema = z.object({
  domain: mirroringizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MirroringizabilityAdminRecord = z.infer<typeof mirroringizabilityAdminRecordSchema>

export const mirroringizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  mirroringizabilityPercent: z.number().min(0).max(100),
})
export type MirroringizabilityAdminStats = z.infer<typeof mirroringizabilityAdminStatsSchema>

export const mirroringizabilityAdminActionSchema = z.enum(['refresh_mirroringizability_summary'])
export type MirroringizabilityAdminAction = z.infer<typeof mirroringizabilityAdminActionSchema>

export const mirroringizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(mirroringizabilityAdminRecordSchema),
  stats: mirroringizabilityAdminStatsSchema,
  availableActions: z.array(mirroringizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MirroringizabilityAdminSummaryResponse = z.infer<
  typeof mirroringizabilityAdminSummaryResponseSchema
>

export const mirroringizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: mirroringizabilityAdminActionSchema,
})
export type MirroringizabilityAdminActionRequest = z.infer<
  typeof mirroringizabilityAdminActionRequestSchema
>

export const mirroringizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: mirroringizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: mirroringizabilityAdminStatsSchema.optional(),
})
export type MirroringizabilityAdminActionResponse = z.infer<
  typeof mirroringizabilityAdminActionResponseSchema
>
