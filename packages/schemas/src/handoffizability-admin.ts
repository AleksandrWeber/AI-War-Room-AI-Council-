import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const handoffizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type HandoffizabilityAdminDomain = z.infer<typeof handoffizabilityAdminDomainSchema>

export const handoffizabilityAdminRecordSchema = z.object({
  domain: handoffizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type HandoffizabilityAdminRecord = z.infer<typeof handoffizabilityAdminRecordSchema>

export const handoffizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  handoffizabilityPercent: z.number().min(0).max(100),
})
export type HandoffizabilityAdminStats = z.infer<typeof handoffizabilityAdminStatsSchema>

export const handoffizabilityAdminActionSchema = z.enum(['refresh_handoffizability_summary'])
export type HandoffizabilityAdminAction = z.infer<typeof handoffizabilityAdminActionSchema>

export const handoffizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(handoffizabilityAdminRecordSchema),
  stats: handoffizabilityAdminStatsSchema,
  availableActions: z.array(handoffizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type HandoffizabilityAdminSummaryResponse = z.infer<
  typeof handoffizabilityAdminSummaryResponseSchema
>

export const handoffizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: handoffizabilityAdminActionSchema,
})
export type HandoffizabilityAdminActionRequest = z.infer<
  typeof handoffizabilityAdminActionRequestSchema
>

export const handoffizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: handoffizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: handoffizabilityAdminStatsSchema.optional(),
})
export type HandoffizabilityAdminActionResponse = z.infer<
  typeof handoffizabilityAdminActionResponseSchema
>
