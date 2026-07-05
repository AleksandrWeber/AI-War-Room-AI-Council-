import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const effectivenessAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'agent_outputs',
  'moderator_syntheses',
])
export type EffectivenessAdminDomain = z.infer<typeof effectivenessAdminDomainSchema>

export const effectivenessAdminRecordSchema = z.object({
  domain: effectivenessAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type EffectivenessAdminRecord = z.infer<typeof effectivenessAdminRecordSchema>

export const effectivenessAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  effectivenessPercent: z.number().min(0).max(100),
})
export type EffectivenessAdminStats = z.infer<typeof effectivenessAdminStatsSchema>

export const effectivenessAdminActionSchema = z.enum(['refresh_effectiveness_summary'])
export type EffectivenessAdminAction = z.infer<typeof effectivenessAdminActionSchema>

export const effectivenessAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(effectivenessAdminRecordSchema),
  stats: effectivenessAdminStatsSchema,
  availableActions: z.array(effectivenessAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type EffectivenessAdminSummaryResponse = z.infer<
  typeof effectivenessAdminSummaryResponseSchema
>

export const effectivenessAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: effectivenessAdminActionSchema,
})
export type EffectivenessAdminActionRequest = z.infer<
  typeof effectivenessAdminActionRequestSchema
>

export const effectivenessAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: effectivenessAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: effectivenessAdminStatsSchema.optional(),
})
export type EffectivenessAdminActionResponse = z.infer<
  typeof effectivenessAdminActionResponseSchema
>
