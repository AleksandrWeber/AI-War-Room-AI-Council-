import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const brokerizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BrokerizabilityRolloutCheckStatus = z.infer<
  typeof brokerizabilityRolloutCheckStatusSchema
>

export const brokerizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: brokerizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BrokerizabilityRolloutCheck = z.infer<typeof brokerizabilityRolloutCheckSchema>

export const brokerizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BrokerizabilityRolloutStatus = z.infer<typeof brokerizabilityRolloutStatusSchema>

export const brokerizabilityCapabilitiesResponseSchema = z.object({
  supportsBrokerizabilityRollout: z.literal(true),
  supportsBrokerizabilityAdminTools: z.literal(true),
  supportsProviderCredentialBrokerizabilitySignals: z.literal(true),
  supportsModelRegistryBrokerizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BrokerizabilityCapabilitiesResponse = z.infer<
  typeof brokerizabilityCapabilitiesResponseSchema
>

export const brokerizabilityRolloutResponseSchema = z.object({
  status: brokerizabilityRolloutStatusSchema,
  checks: z.array(brokerizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BrokerizabilityRolloutResponse = z.infer<
  typeof brokerizabilityRolloutResponseSchema
>

export function getBrokerizabilityRolloutGuidance() {
  return 'Production brokerizability rollout validates provider credential brokerizability, model registry brokerizability signals, billing webhook coverage, and brokerization readiness before production brokerizability tooling.'
}
