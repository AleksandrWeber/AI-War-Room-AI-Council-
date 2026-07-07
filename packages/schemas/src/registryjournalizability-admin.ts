import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const registryjournalizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type RegistryjournalizabilityAdminDomain = z.infer<typeof registryjournalizabilityAdminDomainSchema>

export const registryjournalizabilityAdminRecordSchema = z.object({
  domain: registryjournalizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RegistryjournalizabilityAdminRecord = z.infer<typeof registryjournalizabilityAdminRecordSchema>

export const registryjournalizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  registryjournalizabilityPercent: z.number().min(0).max(100),
})
export type RegistryjournalizabilityAdminStats = z.infer<typeof registryjournalizabilityAdminStatsSchema>

export const registryjournalizabilityAdminActionSchema = z.enum(['refresh_registryjournalizability_summary'])
export type RegistryjournalizabilityAdminAction = z.infer<typeof registryjournalizabilityAdminActionSchema>

export const registryjournalizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(registryjournalizabilityAdminRecordSchema),
  stats: registryjournalizabilityAdminStatsSchema,
  availableActions: z.array(registryjournalizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RegistryjournalizabilityAdminSummaryResponse = z.infer<
  typeof registryjournalizabilityAdminSummaryResponseSchema
>

export const registryjournalizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: registryjournalizabilityAdminActionSchema,
})
export type RegistryjournalizabilityAdminActionRequest = z.infer<
  typeof registryjournalizabilityAdminActionRequestSchema
>

export const registryjournalizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: registryjournalizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: registryjournalizabilityAdminStatsSchema.optional(),
})
export type RegistryjournalizabilityAdminActionResponse = z.infer<
  typeof registryjournalizabilityAdminActionResponseSchema
>
