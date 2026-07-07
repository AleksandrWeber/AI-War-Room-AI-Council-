import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const ledgerizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LedgerizabilityRolloutCheckStatus = z.infer<
  typeof ledgerizabilityRolloutCheckStatusSchema
>

export const ledgerizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: ledgerizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LedgerizabilityRolloutCheck = z.infer<typeof ledgerizabilityRolloutCheckSchema>

export const ledgerizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LedgerizabilityRolloutStatus = z.infer<typeof ledgerizabilityRolloutStatusSchema>

export const ledgerizabilityCapabilitiesResponseSchema = z.object({
  supportsLedgerizabilityRollout: z.literal(true),
  supportsLedgerizabilityAdminTools: z.literal(true),
  supportsShieldScanLedgerizabilitySignals: z.literal(true),
  supportsProviderCredentialLedgerizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LedgerizabilityCapabilitiesResponse = z.infer<
  typeof ledgerizabilityCapabilitiesResponseSchema
>

export const ledgerizabilityRolloutResponseSchema = z.object({
  status: ledgerizabilityRolloutStatusSchema,
  checks: z.array(ledgerizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LedgerizabilityRolloutResponse = z.infer<
  typeof ledgerizabilityRolloutResponseSchema
>

export function getLedgerizabilityRolloutGuidance() {
  return 'Production ledgerizability rollout validates shield scan ledgerizability, provider credential ledgerizability signals, billing webhook coverage, and reconciliationization readiness before production ledgerizability tooling.'
}
