import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const linkabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LinkabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof linkabilityvaultizabilityRolloutCheckStatusSchema
>

export const linkabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: linkabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LinkabilityvaultizabilityRolloutCheck = z.infer<typeof linkabilityvaultizabilityRolloutCheckSchema>

export const linkabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LinkabilityvaultizabilityRolloutStatus = z.infer<typeof linkabilityvaultizabilityRolloutStatusSchema>

export const linkabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsLinkabilityvaultizabilityRollout: z.literal(true),
  supportsLinkabilityvaultizabilityAdminTools: z.literal(true),
  supportsMembershipLinkabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventLinkabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LinkabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof linkabilityvaultizabilityCapabilitiesResponseSchema
>

export const linkabilityvaultizabilityRolloutResponseSchema = z.object({
  status: linkabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(linkabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LinkabilityvaultizabilityRolloutResponse = z.infer<
  typeof linkabilityvaultizabilityRolloutResponseSchema
>

export function getLinkabilityvaultizabilityRolloutGuidance() {
  return 'Production linkabilityvaultizability rollout validates membership linkabilityvaultizability, usage event linkabilityvaultizability signals, billing notification coverage, and healingization readiness before production linkabilityvaultizability tooling.'
}
