import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const modifiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'workspace_memberships',
])
export type ModifiabilityAdminDomain = z.infer<typeof modifiabilityAdminDomainSchema>

export const modifiabilityAdminRecordSchema = z.object({
  domain: modifiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ModifiabilityAdminRecord = z.infer<typeof modifiabilityAdminRecordSchema>

export const modifiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  modifiabilityPercent: z.number().min(0).max(100),
})
export type ModifiabilityAdminStats = z.infer<typeof modifiabilityAdminStatsSchema>

export const modifiabilityAdminActionSchema = z.enum(['refresh_modifiability_summary'])
export type ModifiabilityAdminAction = z.infer<typeof modifiabilityAdminActionSchema>

export const modifiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(modifiabilityAdminRecordSchema),
  stats: modifiabilityAdminStatsSchema,
  availableActions: z.array(modifiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ModifiabilityAdminSummaryResponse = z.infer<
  typeof modifiabilityAdminSummaryResponseSchema
>

export const modifiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: modifiabilityAdminActionSchema,
})
export type ModifiabilityAdminActionRequest = z.infer<
  typeof modifiabilityAdminActionRequestSchema
>

export const modifiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: modifiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: modifiabilityAdminStatsSchema.optional(),
})
export type ModifiabilityAdminActionResponse = z.infer<
  typeof modifiabilityAdminActionResponseSchema
>
