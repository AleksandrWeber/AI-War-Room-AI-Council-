import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const programmabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProgrammabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof programmabilityvaultizabilityRolloutCheckStatusSchema
>

export const programmabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: programmabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProgrammabilityvaultizabilityRolloutCheck = z.infer<typeof programmabilityvaultizabilityRolloutCheckSchema>

export const programmabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProgrammabilityvaultizabilityRolloutStatus = z.infer<typeof programmabilityvaultizabilityRolloutStatusSchema>

export const programmabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsProgrammabilityvaultizabilityRollout: z.literal(true),
  supportsProgrammabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceProgrammabilityvaultizabilitySignals: z.literal(true),
  supportsBillingRecordProgrammabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProgrammabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof programmabilityvaultizabilityCapabilitiesResponseSchema
>

export const programmabilityvaultizabilityRolloutResponseSchema = z.object({
  status: programmabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(programmabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProgrammabilityvaultizabilityRolloutResponse = z.infer<
  typeof programmabilityvaultizabilityRolloutResponseSchema
>

export function getProgrammabilityvaultizabilityRolloutGuidance() {
  return 'Production programmabilityvaultizability rollout validates billing invoice programmabilityvaultizability, billing record programmabilityvaultizability signals, billing webhook coverage, and scalingization readiness before production programmabilityvaultizability tooling.'
}
