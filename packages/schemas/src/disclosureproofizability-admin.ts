import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const disclosureproofizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type DisclosureproofizabilityAdminDomain = z.infer<typeof disclosureproofizabilityAdminDomainSchema>

export const disclosureproofizabilityAdminRecordSchema = z.object({
  domain: disclosureproofizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DisclosureproofizabilityAdminRecord = z.infer<typeof disclosureproofizabilityAdminRecordSchema>

export const disclosureproofizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  disclosureproofizabilityPercent: z.number().min(0).max(100),
})
export type DisclosureproofizabilityAdminStats = z.infer<typeof disclosureproofizabilityAdminStatsSchema>

export const disclosureproofizabilityAdminActionSchema = z.enum(['refresh_disclosureproofizability_summary'])
export type DisclosureproofizabilityAdminAction = z.infer<typeof disclosureproofizabilityAdminActionSchema>

export const disclosureproofizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(disclosureproofizabilityAdminRecordSchema),
  stats: disclosureproofizabilityAdminStatsSchema,
  availableActions: z.array(disclosureproofizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DisclosureproofizabilityAdminSummaryResponse = z.infer<
  typeof disclosureproofizabilityAdminSummaryResponseSchema
>

export const disclosureproofizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: disclosureproofizabilityAdminActionSchema,
})
export type DisclosureproofizabilityAdminActionRequest = z.infer<
  typeof disclosureproofizabilityAdminActionRequestSchema
>

export const disclosureproofizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: disclosureproofizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: disclosureproofizabilityAdminStatsSchema.optional(),
})
export type DisclosureproofizabilityAdminActionResponse = z.infer<
  typeof disclosureproofizabilityAdminActionResponseSchema
>
