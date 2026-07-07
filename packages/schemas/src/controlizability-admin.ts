import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const controlizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type ControlizabilityAdminDomain = z.infer<typeof controlizabilityAdminDomainSchema>

export const controlizabilityAdminRecordSchema = z.object({
  domain: controlizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ControlizabilityAdminRecord = z.infer<typeof controlizabilityAdminRecordSchema>

export const controlizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  controlizabilityPercent: z.number().min(0).max(100),
})
export type ControlizabilityAdminStats = z.infer<typeof controlizabilityAdminStatsSchema>

export const controlizabilityAdminActionSchema = z.enum(['refresh_controlizability_summary'])
export type ControlizabilityAdminAction = z.infer<typeof controlizabilityAdminActionSchema>

export const controlizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(controlizabilityAdminRecordSchema),
  stats: controlizabilityAdminStatsSchema,
  availableActions: z.array(controlizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ControlizabilityAdminSummaryResponse = z.infer<
  typeof controlizabilityAdminSummaryResponseSchema
>

export const controlizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: controlizabilityAdminActionSchema,
})
export type ControlizabilityAdminActionRequest = z.infer<
  typeof controlizabilityAdminActionRequestSchema
>

export const controlizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: controlizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: controlizabilityAdminStatsSchema.optional(),
})
export type ControlizabilityAdminActionResponse = z.infer<
  typeof controlizabilityAdminActionResponseSchema
>
