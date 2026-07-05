import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const axiologizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type AxiologizabilityAdminDomain = z.infer<typeof axiologizabilityAdminDomainSchema>

export const axiologizabilityAdminRecordSchema = z.object({
  domain: axiologizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AxiologizabilityAdminRecord = z.infer<typeof axiologizabilityAdminRecordSchema>

export const axiologizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  axiologizabilityPercent: z.number().min(0).max(100),
})
export type AxiologizabilityAdminStats = z.infer<typeof axiologizabilityAdminStatsSchema>

export const axiologizabilityAdminActionSchema = z.enum(['refresh_axiologizability_summary'])
export type AxiologizabilityAdminAction = z.infer<typeof axiologizabilityAdminActionSchema>

export const axiologizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(axiologizabilityAdminRecordSchema),
  stats: axiologizabilityAdminStatsSchema,
  availableActions: z.array(axiologizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AxiologizabilityAdminSummaryResponse = z.infer<
  typeof axiologizabilityAdminSummaryResponseSchema
>

export const axiologizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: axiologizabilityAdminActionSchema,
})
export type AxiologizabilityAdminActionRequest = z.infer<
  typeof axiologizabilityAdminActionRequestSchema
>

export const axiologizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: axiologizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: axiologizabilityAdminStatsSchema.optional(),
})
export type AxiologizabilityAdminActionResponse = z.infer<
  typeof axiologizabilityAdminActionResponseSchema
>
