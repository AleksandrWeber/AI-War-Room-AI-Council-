import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const inventoryizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type InventoryizabilityRolloutCheckStatus = z.infer<
  typeof inventoryizabilityRolloutCheckStatusSchema
>

export const inventoryizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: inventoryizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type InventoryizabilityRolloutCheck = z.infer<typeof inventoryizabilityRolloutCheckSchema>

export const inventoryizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type InventoryizabilityRolloutStatus = z.infer<typeof inventoryizabilityRolloutStatusSchema>

export const inventoryizabilityCapabilitiesResponseSchema = z.object({
  supportsInventoryizabilityRollout: z.literal(true),
  supportsInventoryizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceInventoryizabilitySignals: z.literal(true),
  supportsBillingRecordInventoryizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type InventoryizabilityCapabilitiesResponse = z.infer<
  typeof inventoryizabilityCapabilitiesResponseSchema
>

export const inventoryizabilityRolloutResponseSchema = z.object({
  status: inventoryizabilityRolloutStatusSchema,
  checks: z.array(inventoryizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type InventoryizabilityRolloutResponse = z.infer<
  typeof inventoryizabilityRolloutResponseSchema
>

export function getInventoryizabilityRolloutGuidance() {
  return 'Production inventoryizability rollout validates billing invoice inventoryizability, billing record inventoryizability signals, billing webhook coverage, and inventoryization readiness before production inventoryizability tooling.'
}
