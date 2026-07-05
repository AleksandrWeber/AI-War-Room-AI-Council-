import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const nomenclatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NomenclatizabilityRolloutCheckStatus = z.infer<
  typeof nomenclatizabilityRolloutCheckStatusSchema
>

export const nomenclatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: nomenclatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NomenclatizabilityRolloutCheck = z.infer<typeof nomenclatizabilityRolloutCheckSchema>

export const nomenclatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NomenclatizabilityRolloutStatus = z.infer<typeof nomenclatizabilityRolloutStatusSchema>

export const nomenclatizabilityCapabilitiesResponseSchema = z.object({
  supportsNomenclatizabilityRollout: z.literal(true),
  supportsNomenclatizabilityAdminTools: z.literal(true),
  supportsModelHealthNomenclatizabilitySignals: z.literal(true),
  supportsModelRegistryNomenclatizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NomenclatizabilityCapabilitiesResponse = z.infer<
  typeof nomenclatizabilityCapabilitiesResponseSchema
>

export const nomenclatizabilityRolloutResponseSchema = z.object({
  status: nomenclatizabilityRolloutStatusSchema,
  checks: z.array(nomenclatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NomenclatizabilityRolloutResponse = z.infer<
  typeof nomenclatizabilityRolloutResponseSchema
>

export function getNomenclatizabilityRolloutGuidance() {
  return 'Production nomenclatizability rollout validates model health nomenclatizability, model registry nomenclatizability signals, billing record coverage, and nomenclatization readiness before production nomenclatizability tooling.'
}
