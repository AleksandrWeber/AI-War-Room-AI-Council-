import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const prooflineizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ProoflineizabilityAdminDomain = z.infer<typeof prooflineizabilityAdminDomainSchema>

export const prooflineizabilityAdminRecordSchema = z.object({
  domain: prooflineizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProoflineizabilityAdminRecord = z.infer<typeof prooflineizabilityAdminRecordSchema>

export const prooflineizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  prooflineizabilityPercent: z.number().min(0).max(100),
})
export type ProoflineizabilityAdminStats = z.infer<typeof prooflineizabilityAdminStatsSchema>

export const prooflineizabilityAdminActionSchema = z.enum(['refresh_prooflineizability_summary'])
export type ProoflineizabilityAdminAction = z.infer<typeof prooflineizabilityAdminActionSchema>

export const prooflineizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(prooflineizabilityAdminRecordSchema),
  stats: prooflineizabilityAdminStatsSchema,
  availableActions: z.array(prooflineizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProoflineizabilityAdminSummaryResponse = z.infer<
  typeof prooflineizabilityAdminSummaryResponseSchema
>

export const prooflineizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: prooflineizabilityAdminActionSchema,
})
export type ProoflineizabilityAdminActionRequest = z.infer<
  typeof prooflineizabilityAdminActionRequestSchema
>

export const prooflineizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: prooflineizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: prooflineizabilityAdminStatsSchema.optional(),
})
export type ProoflineizabilityAdminActionResponse = z.infer<
  typeof prooflineizabilityAdminActionResponseSchema
>
