import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const ledgerizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type LedgerizabilityAdminDomain = z.infer<typeof ledgerizabilityAdminDomainSchema>

export const ledgerizabilityAdminRecordSchema = z.object({
  domain: ledgerizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type LedgerizabilityAdminRecord = z.infer<typeof ledgerizabilityAdminRecordSchema>

export const ledgerizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  ledgerizabilityPercent: z.number().min(0).max(100),
})
export type LedgerizabilityAdminStats = z.infer<typeof ledgerizabilityAdminStatsSchema>

export const ledgerizabilityAdminActionSchema = z.enum(['refresh_ledgerizability_summary'])
export type LedgerizabilityAdminAction = z.infer<typeof ledgerizabilityAdminActionSchema>

export const ledgerizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(ledgerizabilityAdminRecordSchema),
  stats: ledgerizabilityAdminStatsSchema,
  availableActions: z.array(ledgerizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type LedgerizabilityAdminSummaryResponse = z.infer<
  typeof ledgerizabilityAdminSummaryResponseSchema
>

export const ledgerizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ledgerizabilityAdminActionSchema,
})
export type LedgerizabilityAdminActionRequest = z.infer<
  typeof ledgerizabilityAdminActionRequestSchema
>

export const ledgerizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ledgerizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: ledgerizabilityAdminStatsSchema.optional(),
})
export type LedgerizabilityAdminActionResponse = z.infer<
  typeof ledgerizabilityAdminActionResponseSchema
>
