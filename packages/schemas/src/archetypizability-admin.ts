import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const archetypizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_records',
  'billing_invoices',
])
export type ArchetypizabilityAdminDomain = z.infer<typeof archetypizabilityAdminDomainSchema>

export const archetypizabilityAdminRecordSchema = z.object({
  domain: archetypizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ArchetypizabilityAdminRecord = z.infer<typeof archetypizabilityAdminRecordSchema>

export const archetypizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  archetypizabilityPercent: z.number().min(0).max(100),
})
export type ArchetypizabilityAdminStats = z.infer<typeof archetypizabilityAdminStatsSchema>

export const archetypizabilityAdminActionSchema = z.enum(['refresh_archetypizability_summary'])
export type ArchetypizabilityAdminAction = z.infer<typeof archetypizabilityAdminActionSchema>

export const archetypizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(archetypizabilityAdminRecordSchema),
  stats: archetypizabilityAdminStatsSchema,
  availableActions: z.array(archetypizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ArchetypizabilityAdminSummaryResponse = z.infer<
  typeof archetypizabilityAdminSummaryResponseSchema
>

export const archetypizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: archetypizabilityAdminActionSchema,
})
export type ArchetypizabilityAdminActionRequest = z.infer<
  typeof archetypizabilityAdminActionRequestSchema
>

export const archetypizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: archetypizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: archetypizabilityAdminStatsSchema.optional(),
})
export type ArchetypizabilityAdminActionResponse = z.infer<
  typeof archetypizabilityAdminActionResponseSchema
>
