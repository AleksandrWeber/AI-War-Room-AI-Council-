import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const provenanceizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ProvenanceizabilityAdminDomain = z.infer<typeof provenanceizabilityAdminDomainSchema>

export const provenanceizabilityAdminRecordSchema = z.object({
  domain: provenanceizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProvenanceizabilityAdminRecord = z.infer<typeof provenanceizabilityAdminRecordSchema>

export const provenanceizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  provenanceizabilityPercent: z.number().min(0).max(100),
})
export type ProvenanceizabilityAdminStats = z.infer<typeof provenanceizabilityAdminStatsSchema>

export const provenanceizabilityAdminActionSchema = z.enum(['refresh_provenanceizability_summary'])
export type ProvenanceizabilityAdminAction = z.infer<typeof provenanceizabilityAdminActionSchema>

export const provenanceizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(provenanceizabilityAdminRecordSchema),
  stats: provenanceizabilityAdminStatsSchema,
  availableActions: z.array(provenanceizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProvenanceizabilityAdminSummaryResponse = z.infer<
  typeof provenanceizabilityAdminSummaryResponseSchema
>

export const provenanceizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: provenanceizabilityAdminActionSchema,
})
export type ProvenanceizabilityAdminActionRequest = z.infer<
  typeof provenanceizabilityAdminActionRequestSchema
>

export const provenanceizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: provenanceizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: provenanceizabilityAdminStatsSchema.optional(),
})
export type ProvenanceizabilityAdminActionResponse = z.infer<
  typeof provenanceizabilityAdminActionResponseSchema
>
