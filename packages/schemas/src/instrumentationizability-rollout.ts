import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const instrumentationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type InstrumentationizabilityRolloutCheckStatus = z.infer<
  typeof instrumentationizabilityRolloutCheckStatusSchema
>

export const instrumentationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: instrumentationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type InstrumentationizabilityRolloutCheck = z.infer<typeof instrumentationizabilityRolloutCheckSchema>

export const instrumentationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type InstrumentationizabilityRolloutStatus = z.infer<typeof instrumentationizabilityRolloutStatusSchema>

export const instrumentationizabilityCapabilitiesResponseSchema = z.object({
  supportsInstrumentationizabilityRollout: z.literal(true),
  supportsInstrumentationizabilityAdminTools: z.literal(true),
  supportsShieldScanInstrumentationizabilitySignals: z.literal(true),
  supportsProviderCredentialInstrumentationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type InstrumentationizabilityCapabilitiesResponse = z.infer<
  typeof instrumentationizabilityCapabilitiesResponseSchema
>

export const instrumentationizabilityRolloutResponseSchema = z.object({
  status: instrumentationizabilityRolloutStatusSchema,
  checks: z.array(instrumentationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type InstrumentationizabilityRolloutResponse = z.infer<
  typeof instrumentationizabilityRolloutResponseSchema
>

export function getInstrumentationizabilityRolloutGuidance() {
  return 'Production instrumentationizability rollout validates shield scan instrumentationizability, provider credential instrumentationizability signals, billing webhook coverage, and reconciliationization readiness before production instrumentationizability tooling.'
}
