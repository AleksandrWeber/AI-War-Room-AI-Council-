import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const simulatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SimulatizabilityRolloutCheckStatus = z.infer<
  typeof simulatizabilityRolloutCheckStatusSchema
>

export const simulatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: simulatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SimulatizabilityRolloutCheck = z.infer<typeof simulatizabilityRolloutCheckSchema>

export const simulatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SimulatizabilityRolloutStatus = z.infer<typeof simulatizabilityRolloutStatusSchema>

export const simulatizabilityCapabilitiesResponseSchema = z.object({
  supportsSimulatizabilityRollout: z.literal(true),
  supportsSimulatizabilityAdminTools: z.literal(true),
  supportsProviderCredentialSimulatizabilitySignals: z.literal(true),
  supportsModelRegistrySimulatizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SimulatizabilityCapabilitiesResponse = z.infer<
  typeof simulatizabilityCapabilitiesResponseSchema
>

export const simulatizabilityRolloutResponseSchema = z.object({
  status: simulatizabilityRolloutStatusSchema,
  checks: z.array(simulatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SimulatizabilityRolloutResponse = z.infer<
  typeof simulatizabilityRolloutResponseSchema
>

export function getSimulatizabilityRolloutGuidance() {
  return 'Production simulatizability rollout validates provider credential simulatizability, model registry simulatizability signals, billing webhook coverage, and simulatization readiness before production simulatizability tooling.'
}
