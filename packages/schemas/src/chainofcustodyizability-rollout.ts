import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const chainofcustodyizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ChainofcustodyizabilityRolloutCheckStatus = z.infer<
  typeof chainofcustodyizabilityRolloutCheckStatusSchema
>

export const chainofcustodyizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: chainofcustodyizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ChainofcustodyizabilityRolloutCheck = z.infer<typeof chainofcustodyizabilityRolloutCheckSchema>

export const chainofcustodyizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ChainofcustodyizabilityRolloutStatus = z.infer<typeof chainofcustodyizabilityRolloutStatusSchema>

export const chainofcustodyizabilityCapabilitiesResponseSchema = z.object({
  supportsChainofcustodyizabilityRollout: z.literal(true),
  supportsChainofcustodyizabilityAdminTools: z.literal(true),
  supportsShieldScanChainofcustodyizabilitySignals: z.literal(true),
  supportsProviderCredentialChainofcustodyizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ChainofcustodyizabilityCapabilitiesResponse = z.infer<
  typeof chainofcustodyizabilityCapabilitiesResponseSchema
>

export const chainofcustodyizabilityRolloutResponseSchema = z.object({
  status: chainofcustodyizabilityRolloutStatusSchema,
  checks: z.array(chainofcustodyizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ChainofcustodyizabilityRolloutResponse = z.infer<
  typeof chainofcustodyizabilityRolloutResponseSchema
>

export function getChainofcustodyizabilityRolloutGuidance() {
  return 'Production chainofcustodyizability rollout validates shield scan chainofcustodyizability, provider credential chainofcustodyizability signals, billing webhook coverage, and reconciliationization readiness before production chainofcustodyizability tooling.'
}
