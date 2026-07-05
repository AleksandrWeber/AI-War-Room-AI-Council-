import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const representabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type RepresentabilityAdminDomain = z.infer<typeof representabilityAdminDomainSchema>

export const representabilityAdminRecordSchema = z.object({
  domain: representabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RepresentabilityAdminRecord = z.infer<typeof representabilityAdminRecordSchema>

export const representabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  representabilityPercent: z.number().min(0).max(100),
})
export type RepresentabilityAdminStats = z.infer<typeof representabilityAdminStatsSchema>

export const representabilityAdminActionSchema = z.enum(['refresh_representability_summary'])
export type RepresentabilityAdminAction = z.infer<typeof representabilityAdminActionSchema>

export const representabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(representabilityAdminRecordSchema),
  stats: representabilityAdminStatsSchema,
  availableActions: z.array(representabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RepresentabilityAdminSummaryResponse = z.infer<
  typeof representabilityAdminSummaryResponseSchema
>

export const representabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: representabilityAdminActionSchema,
})
export type RepresentabilityAdminActionRequest = z.infer<
  typeof representabilityAdminActionRequestSchema
>

export const representabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: representabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: representabilityAdminStatsSchema.optional(),
})
export type RepresentabilityAdminActionResponse = z.infer<
  typeof representabilityAdminActionResponseSchema
>
