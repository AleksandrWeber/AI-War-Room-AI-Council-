import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const propagationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type PropagationizabilityAdminDomain = z.infer<typeof propagationizabilityAdminDomainSchema>

export const propagationizabilityAdminRecordSchema = z.object({
  domain: propagationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PropagationizabilityAdminRecord = z.infer<typeof propagationizabilityAdminRecordSchema>

export const propagationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  propagationizabilityPercent: z.number().min(0).max(100),
})
export type PropagationizabilityAdminStats = z.infer<typeof propagationizabilityAdminStatsSchema>

export const propagationizabilityAdminActionSchema = z.enum(['refresh_propagationizability_summary'])
export type PropagationizabilityAdminAction = z.infer<typeof propagationizabilityAdminActionSchema>

export const propagationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(propagationizabilityAdminRecordSchema),
  stats: propagationizabilityAdminStatsSchema,
  availableActions: z.array(propagationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PropagationizabilityAdminSummaryResponse = z.infer<
  typeof propagationizabilityAdminSummaryResponseSchema
>

export const propagationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: propagationizabilityAdminActionSchema,
})
export type PropagationizabilityAdminActionRequest = z.infer<
  typeof propagationizabilityAdminActionRequestSchema
>

export const propagationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: propagationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: propagationizabilityAdminStatsSchema.optional(),
})
export type PropagationizabilityAdminActionResponse = z.infer<
  typeof propagationizabilityAdminActionResponseSchema
>
