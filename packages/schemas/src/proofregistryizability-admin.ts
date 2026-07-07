import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const proofregistryizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ProofregistryizabilityAdminDomain = z.infer<typeof proofregistryizabilityAdminDomainSchema>

export const proofregistryizabilityAdminRecordSchema = z.object({
  domain: proofregistryizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProofregistryizabilityAdminRecord = z.infer<typeof proofregistryizabilityAdminRecordSchema>

export const proofregistryizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  proofregistryizabilityPercent: z.number().min(0).max(100),
})
export type ProofregistryizabilityAdminStats = z.infer<typeof proofregistryizabilityAdminStatsSchema>

export const proofregistryizabilityAdminActionSchema = z.enum(['refresh_proofregistryizability_summary'])
export type ProofregistryizabilityAdminAction = z.infer<typeof proofregistryizabilityAdminActionSchema>

export const proofregistryizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(proofregistryizabilityAdminRecordSchema),
  stats: proofregistryizabilityAdminStatsSchema,
  availableActions: z.array(proofregistryizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProofregistryizabilityAdminSummaryResponse = z.infer<
  typeof proofregistryizabilityAdminSummaryResponseSchema
>

export const proofregistryizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: proofregistryizabilityAdminActionSchema,
})
export type ProofregistryizabilityAdminActionRequest = z.infer<
  typeof proofregistryizabilityAdminActionRequestSchema
>

export const proofregistryizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: proofregistryizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: proofregistryizabilityAdminStatsSchema.optional(),
})
export type ProofregistryizabilityAdminActionResponse = z.infer<
  typeof proofregistryizabilityAdminActionResponseSchema
>
