import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'

export const externalAuthVendorSchema = z.enum(['clerk', 'auth0'])
export type ExternalAuthVendor = z.infer<typeof externalAuthVendorSchema>

export const externalAuthAdapterSchema = z.enum(['mock', 'jwks'])
export type ExternalAuthAdapter = z.infer<typeof externalAuthAdapterSchema>

export const externalAuthIdentitySchema = z.object({
  userId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema.optional(),
  email: z.email().optional(),
  vendor: externalAuthVendorSchema,
  subject: nonEmptyStringSchema,
})
export type ExternalAuthIdentity = z.infer<typeof externalAuthIdentitySchema>

export function mapExternalUserId(
  vendor: ExternalAuthVendor,
  subject: string,
) {
  return `${vendor}_${subject}`
}

export function resolveExternalAuthClaims(input: {
  vendor: ExternalAuthVendor
  payload: Record<string, unknown>
  userIdClaim: string
  workspaceIdClaim?: string
}) {
  const subject = readClaim(input.payload, input.userIdClaim)

  if (!subject) {
    throw new Error(`Missing external auth claim "${input.userIdClaim}".`)
  }

  const workspaceId = input.workspaceIdClaim
    ? readClaim(input.payload, input.workspaceIdClaim) ?? undefined
    : undefined

  return externalAuthIdentitySchema.parse({
    userId: mapExternalUserId(input.vendor, subject),
    workspaceId,
    email: readOptionalEmail(input.payload),
    vendor: input.vendor,
    subject,
  })
}

function readClaim(payload: Record<string, unknown>, claimPath: string) {
  const value = claimPath
    .split('.')
    .reduce<unknown>((current, segment) => {
      if (!current || typeof current !== 'object') {
        return undefined
      }

      return (current as Record<string, unknown>)[segment]
    }, payload)

  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function readOptionalEmail(payload: Record<string, unknown>) {
  const email = payload.email

  return typeof email === 'string' && email.includes('@') ? email : undefined
}

export function getDefaultExternalWorkspaceClaim(vendor: ExternalAuthVendor) {
  switch (vendor) {
    case 'clerk':
      return 'org_id'
    case 'auth0':
      return 'https://ai-war-room.dev/workspace_id'
  }
}

export function getExternalAuthGuidance(vendor: ExternalAuthVendor) {
  switch (vendor) {
    case 'clerk':
      return 'Send a Clerk session JWT in Authorization: Bearer <token>. Workspace context can come from org_id or x-workspace-id.'
    case 'auth0':
      return 'Send an Auth0 access token in Authorization: Bearer <token>. Workspace context can come from the configured custom claim or x-workspace-id.'
  }
}
