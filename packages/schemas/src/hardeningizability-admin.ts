import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const hardeningizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type HardeningizabilityAdminDomain = z.infer<typeof hardeningizabilityAdminDomainSchema>

export const hardeningizabilityAdminRecordSchema = z.object({
  domain: hardeningizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type HardeningizabilityAdminRecord = z.infer<typeof hardeningizabilityAdminRecordSchema>

export const hardeningizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  hardeningizabilityPercent: z.number().min(0).max(100),
})
export type HardeningizabilityAdminStats = z.infer<typeof hardeningizabilityAdminStatsSchema>

export const hardeningizabilityAdminActionSchema = z.enum(['refresh_hardeningizability_summary'])
export type HardeningizabilityAdminAction = z.infer<typeof hardeningizabilityAdminActionSchema>

export const hardeningizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(hardeningizabilityAdminRecordSchema),
  stats: hardeningizabilityAdminStatsSchema,
  availableActions: z.array(hardeningizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type HardeningizabilityAdminSummaryResponse = z.infer<
  typeof hardeningizabilityAdminSummaryResponseSchema
>

export const hardeningizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: hardeningizabilityAdminActionSchema,
})
export type HardeningizabilityAdminActionRequest = z.infer<
  typeof hardeningizabilityAdminActionRequestSchema
>

export const hardeningizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: hardeningizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: hardeningizabilityAdminStatsSchema.optional(),
})
export type HardeningizabilityAdminActionResponse = z.infer<
  typeof hardeningizabilityAdminActionResponseSchema
>
