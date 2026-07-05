import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const availabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'blocked_runs',
  'usage_events',
])
export type AvailabilityAdminDomain = z.infer<
  typeof availabilityAdminDomainSchema
>

export const availabilityAdminRecordSchema = z.object({
  domain: availabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AvailabilityAdminRecord = z.infer<
  typeof availabilityAdminRecordSchema
>

export const availabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  availabilityPercent: z.number().min(0).max(100),
})
export type AvailabilityAdminStats = z.infer<typeof availabilityAdminStatsSchema>

export const availabilityAdminActionSchema = z.enum(['refresh_availability_summary'])
export type AvailabilityAdminAction = z.infer<
  typeof availabilityAdminActionSchema
>

export const availabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(availabilityAdminRecordSchema),
  stats: availabilityAdminStatsSchema,
  availableActions: z.array(availabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AvailabilityAdminSummaryResponse = z.infer<
  typeof availabilityAdminSummaryResponseSchema
>

export const availabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: availabilityAdminActionSchema,
})
export type AvailabilityAdminActionRequest = z.infer<
  typeof availabilityAdminActionRequestSchema
>

export const availabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: availabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: availabilityAdminStatsSchema.optional(),
})
export type AvailabilityAdminActionResponse = z.infer<
  typeof availabilityAdminActionResponseSchema
>
