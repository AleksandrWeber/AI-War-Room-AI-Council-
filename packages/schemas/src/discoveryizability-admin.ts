import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const discoveryizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type DiscoveryizabilityAdminDomain = z.infer<typeof discoveryizabilityAdminDomainSchema>

export const discoveryizabilityAdminRecordSchema = z.object({
  domain: discoveryizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DiscoveryizabilityAdminRecord = z.infer<typeof discoveryizabilityAdminRecordSchema>

export const discoveryizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  discoveryizabilityPercent: z.number().min(0).max(100),
})
export type DiscoveryizabilityAdminStats = z.infer<typeof discoveryizabilityAdminStatsSchema>

export const discoveryizabilityAdminActionSchema = z.enum(['refresh_discoveryizability_summary'])
export type DiscoveryizabilityAdminAction = z.infer<typeof discoveryizabilityAdminActionSchema>

export const discoveryizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(discoveryizabilityAdminRecordSchema),
  stats: discoveryizabilityAdminStatsSchema,
  availableActions: z.array(discoveryizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DiscoveryizabilityAdminSummaryResponse = z.infer<
  typeof discoveryizabilityAdminSummaryResponseSchema
>

export const discoveryizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: discoveryizabilityAdminActionSchema,
})
export type DiscoveryizabilityAdminActionRequest = z.infer<
  typeof discoveryizabilityAdminActionRequestSchema
>

export const discoveryizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: discoveryizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: discoveryizabilityAdminStatsSchema.optional(),
})
export type DiscoveryizabilityAdminActionResponse = z.infer<
  typeof discoveryizabilityAdminActionResponseSchema
>
