import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const availabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type AvailabilizabilityAdminDomain = z.infer<typeof availabilizabilityAdminDomainSchema>

export const availabilizabilityAdminRecordSchema = z.object({
  domain: availabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AvailabilizabilityAdminRecord = z.infer<typeof availabilizabilityAdminRecordSchema>

export const availabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  availabilizabilityPercent: z.number().min(0).max(100),
})
export type AvailabilizabilityAdminStats = z.infer<typeof availabilizabilityAdminStatsSchema>

export const availabilizabilityAdminActionSchema = z.enum(['refresh_availabilizability_summary'])
export type AvailabilizabilityAdminAction = z.infer<typeof availabilizabilityAdminActionSchema>

export const availabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(availabilizabilityAdminRecordSchema),
  stats: availabilizabilityAdminStatsSchema,
  availableActions: z.array(availabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AvailabilizabilityAdminSummaryResponse = z.infer<
  typeof availabilizabilityAdminSummaryResponseSchema
>

export const availabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: availabilizabilityAdminActionSchema,
})
export type AvailabilizabilityAdminActionRequest = z.infer<
  typeof availabilizabilityAdminActionRequestSchema
>

export const availabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: availabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: availabilizabilityAdminStatsSchema.optional(),
})
export type AvailabilizabilityAdminActionResponse = z.infer<
  typeof availabilizabilityAdminActionResponseSchema
>
