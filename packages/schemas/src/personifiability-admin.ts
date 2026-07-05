import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const personifiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'agent_outputs',
  'moderator_syntheses',
])
export type PersonifiabilityAdminDomain = z.infer<typeof personifiabilityAdminDomainSchema>

export const personifiabilityAdminRecordSchema = z.object({
  domain: personifiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PersonifiabilityAdminRecord = z.infer<typeof personifiabilityAdminRecordSchema>

export const personifiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  personifiabilityPercent: z.number().min(0).max(100),
})
export type PersonifiabilityAdminStats = z.infer<typeof personifiabilityAdminStatsSchema>

export const personifiabilityAdminActionSchema = z.enum(['refresh_personifiability_summary'])
export type PersonifiabilityAdminAction = z.infer<typeof personifiabilityAdminActionSchema>

export const personifiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(personifiabilityAdminRecordSchema),
  stats: personifiabilityAdminStatsSchema,
  availableActions: z.array(personifiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PersonifiabilityAdminSummaryResponse = z.infer<
  typeof personifiabilityAdminSummaryResponseSchema
>

export const personifiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: personifiabilityAdminActionSchema,
})
export type PersonifiabilityAdminActionRequest = z.infer<
  typeof personifiabilityAdminActionRequestSchema
>

export const personifiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: personifiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: personifiabilityAdminStatsSchema.optional(),
})
export type PersonifiabilityAdminActionResponse = z.infer<
  typeof personifiabilityAdminActionResponseSchema
>
