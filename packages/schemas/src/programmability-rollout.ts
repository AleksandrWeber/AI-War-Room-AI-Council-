import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const programmabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProgrammabilityRolloutCheckStatus = z.infer<
  typeof programmabilityRolloutCheckStatusSchema
>

export const programmabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: programmabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProgrammabilityRolloutCheck = z.infer<typeof programmabilityRolloutCheckSchema>

export const programmabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProgrammabilityRolloutStatus = z.infer<typeof programmabilityRolloutStatusSchema>

export const programmabilityCapabilitiesResponseSchema = z.object({
  supportsProgrammabilityRollout: z.literal(true),
  supportsProgrammabilityAdminTools: z.literal(true),
  supportsWorkflowProgrammabilitySignals: z.literal(true),
  supportsAgentOutputProgrammabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProgrammabilityCapabilitiesResponse = z.infer<
  typeof programmabilityCapabilitiesResponseSchema
>

export const programmabilityRolloutResponseSchema = z.object({
  status: programmabilityRolloutStatusSchema,
  checks: z.array(programmabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProgrammabilityRolloutResponse = z.infer<
  typeof programmabilityRolloutResponseSchema
>

export function getProgrammabilityRolloutGuidance() {
  return 'Production programmability rollout validates workflow programmability, agent output programmability signals, artifact coverage, and programming readiness before production programmability tooling.'
}
