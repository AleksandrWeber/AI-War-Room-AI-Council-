import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const trustworthinessRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TrustworthinessRolloutCheckStatus = z.infer<
  typeof trustworthinessRolloutCheckStatusSchema
>

export const trustworthinessRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: trustworthinessRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TrustworthinessRolloutCheck = z.infer<typeof trustworthinessRolloutCheckSchema>

export const trustworthinessRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TrustworthinessRolloutStatus = z.infer<typeof trustworthinessRolloutStatusSchema>

export const trustworthinessCapabilitiesResponseSchema = z.object({
  supportsTrustworthinessRollout: z.literal(true),
  supportsTrustworthinessAdminTools: z.literal(true),
  supportsShieldScanTrustworthinessSignals: z.literal(true),
  supportsProviderCredentialTrustworthinessSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TrustworthinessCapabilitiesResponse = z.infer<
  typeof trustworthinessCapabilitiesResponseSchema
>

export const trustworthinessRolloutResponseSchema = z.object({
  status: trustworthinessRolloutStatusSchema,
  checks: z.array(trustworthinessRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TrustworthinessRolloutResponse = z.infer<
  typeof trustworthinessRolloutResponseSchema
>

export function getTrustworthinessRolloutGuidance() {
  return 'Production trustworthiness rollout validates shield scan trustworthiness, provider credential trustworthiness signals, billing webhook coverage, and trust readiness before production trustworthiness tooling.'
}
