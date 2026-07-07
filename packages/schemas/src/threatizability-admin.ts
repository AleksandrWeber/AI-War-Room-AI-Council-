import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const threatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ThreatizabilityAdminDomain = z.infer<typeof threatizabilityAdminDomainSchema>

export const threatizabilityAdminRecordSchema = z.object({
  domain: threatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ThreatizabilityAdminRecord = z.infer<typeof threatizabilityAdminRecordSchema>

export const threatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  threatizabilityPercent: z.number().min(0).max(100),
})
export type ThreatizabilityAdminStats = z.infer<typeof threatizabilityAdminStatsSchema>

export const threatizabilityAdminActionSchema = z.enum(['refresh_threatizability_summary'])
export type ThreatizabilityAdminAction = z.infer<typeof threatizabilityAdminActionSchema>

export const threatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(threatizabilityAdminRecordSchema),
  stats: threatizabilityAdminStatsSchema,
  availableActions: z.array(threatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ThreatizabilityAdminSummaryResponse = z.infer<
  typeof threatizabilityAdminSummaryResponseSchema
>

export const threatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: threatizabilityAdminActionSchema,
})
export type ThreatizabilityAdminActionRequest = z.infer<
  typeof threatizabilityAdminActionRequestSchema
>

export const threatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: threatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: threatizabilityAdminStatsSchema.optional(),
})
export type ThreatizabilityAdminActionResponse = z.infer<
  typeof threatizabilityAdminActionResponseSchema
>
