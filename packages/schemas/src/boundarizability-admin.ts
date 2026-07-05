import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const boundarizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type BoundarizabilityAdminDomain = z.infer<typeof boundarizabilityAdminDomainSchema>

export const boundarizabilityAdminRecordSchema = z.object({
  domain: boundarizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BoundarizabilityAdminRecord = z.infer<typeof boundarizabilityAdminRecordSchema>

export const boundarizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  boundarizabilityPercent: z.number().min(0).max(100),
})
export type BoundarizabilityAdminStats = z.infer<typeof boundarizabilityAdminStatsSchema>

export const boundarizabilityAdminActionSchema = z.enum(['refresh_boundarizability_summary'])
export type BoundarizabilityAdminAction = z.infer<typeof boundarizabilityAdminActionSchema>

export const boundarizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(boundarizabilityAdminRecordSchema),
  stats: boundarizabilityAdminStatsSchema,
  availableActions: z.array(boundarizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BoundarizabilityAdminSummaryResponse = z.infer<
  typeof boundarizabilityAdminSummaryResponseSchema
>

export const boundarizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: boundarizabilityAdminActionSchema,
})
export type BoundarizabilityAdminActionRequest = z.infer<
  typeof boundarizabilityAdminActionRequestSchema
>

export const boundarizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: boundarizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: boundarizabilityAdminStatsSchema.optional(),
})
export type BoundarizabilityAdminActionResponse = z.infer<
  typeof boundarizabilityAdminActionResponseSchema
>
