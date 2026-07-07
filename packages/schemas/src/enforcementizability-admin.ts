import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const enforcementizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type EnforcementizabilityAdminDomain = z.infer<typeof enforcementizabilityAdminDomainSchema>

export const enforcementizabilityAdminRecordSchema = z.object({
  domain: enforcementizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EnforcementizabilityAdminRecord = z.infer<typeof enforcementizabilityAdminRecordSchema>

export const enforcementizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  enforcementizabilityPercent: z.number().min(0).max(100),
})
export type EnforcementizabilityAdminStats = z.infer<typeof enforcementizabilityAdminStatsSchema>

export const enforcementizabilityAdminActionSchema = z.enum(['refresh_enforcementizability_summary'])
export type EnforcementizabilityAdminAction = z.infer<typeof enforcementizabilityAdminActionSchema>

export const enforcementizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(enforcementizabilityAdminRecordSchema),
  stats: enforcementizabilityAdminStatsSchema,
  availableActions: z.array(enforcementizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EnforcementizabilityAdminSummaryResponse = z.infer<
  typeof enforcementizabilityAdminSummaryResponseSchema
>

export const enforcementizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: enforcementizabilityAdminActionSchema,
})
export type EnforcementizabilityAdminActionRequest = z.infer<
  typeof enforcementizabilityAdminActionRequestSchema
>

export const enforcementizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: enforcementizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: enforcementizabilityAdminStatsSchema.optional(),
})
export type EnforcementizabilityAdminActionResponse = z.infer<
  typeof enforcementizabilityAdminActionResponseSchema
>
