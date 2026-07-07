import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const disclosureizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type DisclosureizabilityAdminDomain = z.infer<typeof disclosureizabilityAdminDomainSchema>

export const disclosureizabilityAdminRecordSchema = z.object({
  domain: disclosureizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DisclosureizabilityAdminRecord = z.infer<typeof disclosureizabilityAdminRecordSchema>

export const disclosureizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  disclosureizabilityPercent: z.number().min(0).max(100),
})
export type DisclosureizabilityAdminStats = z.infer<typeof disclosureizabilityAdminStatsSchema>

export const disclosureizabilityAdminActionSchema = z.enum(['refresh_disclosureizability_summary'])
export type DisclosureizabilityAdminAction = z.infer<typeof disclosureizabilityAdminActionSchema>

export const disclosureizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(disclosureizabilityAdminRecordSchema),
  stats: disclosureizabilityAdminStatsSchema,
  availableActions: z.array(disclosureizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DisclosureizabilityAdminSummaryResponse = z.infer<
  typeof disclosureizabilityAdminSummaryResponseSchema
>

export const disclosureizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: disclosureizabilityAdminActionSchema,
})
export type DisclosureizabilityAdminActionRequest = z.infer<
  typeof disclosureizabilityAdminActionRequestSchema
>

export const disclosureizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: disclosureizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: disclosureizabilityAdminStatsSchema.optional(),
})
export type DisclosureizabilityAdminActionResponse = z.infer<
  typeof disclosureizabilityAdminActionResponseSchema
>
