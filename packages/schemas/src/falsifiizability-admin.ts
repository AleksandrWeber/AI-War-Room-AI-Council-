import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const falsifiizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type FalsifiizabilityAdminDomain = z.infer<typeof falsifiizabilityAdminDomainSchema>

export const falsifiizabilityAdminRecordSchema = z.object({
  domain: falsifiizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FalsifiizabilityAdminRecord = z.infer<typeof falsifiizabilityAdminRecordSchema>

export const falsifiizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  falsifiizabilityPercent: z.number().min(0).max(100),
})
export type FalsifiizabilityAdminStats = z.infer<typeof falsifiizabilityAdminStatsSchema>

export const falsifiizabilityAdminActionSchema = z.enum(['refresh_falsifiizability_summary'])
export type FalsifiizabilityAdminAction = z.infer<typeof falsifiizabilityAdminActionSchema>

export const falsifiizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(falsifiizabilityAdminRecordSchema),
  stats: falsifiizabilityAdminStatsSchema,
  availableActions: z.array(falsifiizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FalsifiizabilityAdminSummaryResponse = z.infer<
  typeof falsifiizabilityAdminSummaryResponseSchema
>

export const falsifiizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: falsifiizabilityAdminActionSchema,
})
export type FalsifiizabilityAdminActionRequest = z.infer<
  typeof falsifiizabilityAdminActionRequestSchema
>

export const falsifiizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: falsifiizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: falsifiizabilityAdminStatsSchema.optional(),
})
export type FalsifiizabilityAdminActionResponse = z.infer<
  typeof falsifiizabilityAdminActionResponseSchema
>
