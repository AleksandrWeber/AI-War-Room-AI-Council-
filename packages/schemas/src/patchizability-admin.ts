import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const patchizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type PatchizabilityAdminDomain = z.infer<typeof patchizabilityAdminDomainSchema>

export const patchizabilityAdminRecordSchema = z.object({
  domain: patchizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PatchizabilityAdminRecord = z.infer<typeof patchizabilityAdminRecordSchema>

export const patchizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  patchizabilityPercent: z.number().min(0).max(100),
})
export type PatchizabilityAdminStats = z.infer<typeof patchizabilityAdminStatsSchema>

export const patchizabilityAdminActionSchema = z.enum(['refresh_patchizability_summary'])
export type PatchizabilityAdminAction = z.infer<typeof patchizabilityAdminActionSchema>

export const patchizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(patchizabilityAdminRecordSchema),
  stats: patchizabilityAdminStatsSchema,
  availableActions: z.array(patchizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PatchizabilityAdminSummaryResponse = z.infer<
  typeof patchizabilityAdminSummaryResponseSchema
>

export const patchizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: patchizabilityAdminActionSchema,
})
export type PatchizabilityAdminActionRequest = z.infer<
  typeof patchizabilityAdminActionRequestSchema
>

export const patchizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: patchizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: patchizabilityAdminStatsSchema.optional(),
})
export type PatchizabilityAdminActionResponse = z.infer<
  typeof patchizabilityAdminActionResponseSchema
>
