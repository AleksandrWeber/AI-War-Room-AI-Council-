import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const scriptabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ScriptabilizabilityRolloutCheckStatus = z.infer<
  typeof scriptabilizabilityRolloutCheckStatusSchema
>

export const scriptabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: scriptabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ScriptabilizabilityRolloutCheck = z.infer<typeof scriptabilizabilityRolloutCheckSchema>

export const scriptabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ScriptabilizabilityRolloutStatus = z.infer<typeof scriptabilizabilityRolloutStatusSchema>

export const scriptabilizabilityCapabilitiesResponseSchema = z.object({
  supportsScriptabilizabilityRollout: z.literal(true),
  supportsScriptabilizabilityAdminTools: z.literal(true),
  supportsShieldScanScriptabilizabilitySignals: z.literal(true),
  supportsProviderCredentialScriptabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ScriptabilizabilityCapabilitiesResponse = z.infer<
  typeof scriptabilizabilityCapabilitiesResponseSchema
>

export const scriptabilizabilityRolloutResponseSchema = z.object({
  status: scriptabilizabilityRolloutStatusSchema,
  checks: z.array(scriptabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ScriptabilizabilityRolloutResponse = z.infer<
  typeof scriptabilizabilityRolloutResponseSchema
>

export function getScriptabilizabilityRolloutGuidance() {
  return 'Production scriptabilizability rollout validates shield scan scriptabilizability, provider credential scriptabilizability signals, billing webhook coverage, and scriptabilization readiness before production scriptabilizability tooling.'
}
