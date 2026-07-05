import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const phenomenizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type PhenomenizabilityAdminDomain = z.infer<typeof phenomenizabilityAdminDomainSchema>

export const phenomenizabilityAdminRecordSchema = z.object({
  domain: phenomenizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PhenomenizabilityAdminRecord = z.infer<typeof phenomenizabilityAdminRecordSchema>

export const phenomenizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  phenomenizabilityPercent: z.number().min(0).max(100),
})
export type PhenomenizabilityAdminStats = z.infer<typeof phenomenizabilityAdminStatsSchema>

export const phenomenizabilityAdminActionSchema = z.enum(['refresh_phenomenizability_summary'])
export type PhenomenizabilityAdminAction = z.infer<typeof phenomenizabilityAdminActionSchema>

export const phenomenizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(phenomenizabilityAdminRecordSchema),
  stats: phenomenizabilityAdminStatsSchema,
  availableActions: z.array(phenomenizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PhenomenizabilityAdminSummaryResponse = z.infer<
  typeof phenomenizabilityAdminSummaryResponseSchema
>

export const phenomenizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: phenomenizabilityAdminActionSchema,
})
export type PhenomenizabilityAdminActionRequest = z.infer<
  typeof phenomenizabilityAdminActionRequestSchema
>

export const phenomenizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: phenomenizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: phenomenizabilityAdminStatsSchema.optional(),
})
export type PhenomenizabilityAdminActionResponse = z.infer<
  typeof phenomenizabilityAdminActionResponseSchema
>
