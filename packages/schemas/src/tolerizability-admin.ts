import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const tolerizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type TolerizabilityAdminDomain = z.infer<typeof tolerizabilityAdminDomainSchema>

export const tolerizabilityAdminRecordSchema = z.object({
  domain: tolerizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TolerizabilityAdminRecord = z.infer<typeof tolerizabilityAdminRecordSchema>

export const tolerizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  tolerizabilityPercent: z.number().min(0).max(100),
})
export type TolerizabilityAdminStats = z.infer<typeof tolerizabilityAdminStatsSchema>

export const tolerizabilityAdminActionSchema = z.enum(['refresh_tolerizability_summary'])
export type TolerizabilityAdminAction = z.infer<typeof tolerizabilityAdminActionSchema>

export const tolerizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(tolerizabilityAdminRecordSchema),
  stats: tolerizabilityAdminStatsSchema,
  availableActions: z.array(tolerizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TolerizabilityAdminSummaryResponse = z.infer<
  typeof tolerizabilityAdminSummaryResponseSchema
>

export const tolerizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tolerizabilityAdminActionSchema,
})
export type TolerizabilityAdminActionRequest = z.infer<
  typeof tolerizabilityAdminActionRequestSchema
>

export const tolerizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tolerizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: tolerizabilityAdminStatsSchema.optional(),
})
export type TolerizabilityAdminActionResponse = z.infer<
  typeof tolerizabilityAdminActionResponseSchema
>
