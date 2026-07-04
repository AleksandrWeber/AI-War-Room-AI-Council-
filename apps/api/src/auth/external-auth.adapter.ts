import { SignJWT, createRemoteJWKSet, jwtVerify } from 'jose'
import {
  getDefaultExternalWorkspaceClaim,
  getExternalAuthGuidance,
  resolveExternalAuthClaims,
  type ExternalAuthIdentity,
  type ExternalAuthVendor,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

export async function verifyExternalAuthToken(input: {
  token: string
  env: Pick<
    ApiEnv,
    | 'AUTH_EXTERNAL_ADAPTER'
    | 'AUTH_EXTERNAL_VENDOR'
    | 'AUTH_EXTERNAL_JWT_SECRET'
    | 'AUTH_EXTERNAL_JWKS_URL'
    | 'AUTH_EXTERNAL_ISSUER'
    | 'AUTH_EXTERNAL_AUDIENCE'
    | 'AUTH_EXTERNAL_USER_ID_CLAIM'
    | 'AUTH_EXTERNAL_WORKSPACE_ID_CLAIM'
  >
}) {
  const payload = await decodeExternalAuthPayload(input)
  const workspaceClaim =
    input.env.AUTH_EXTERNAL_WORKSPACE_ID_CLAIM ??
    getDefaultExternalWorkspaceClaim(input.env.AUTH_EXTERNAL_VENDOR)

  return resolveExternalAuthClaims({
    vendor: input.env.AUTH_EXTERNAL_VENDOR,
    payload,
    userIdClaim: input.env.AUTH_EXTERNAL_USER_ID_CLAIM,
    workspaceIdClaim: workspaceClaim,
  })
}

export function getExternalAuthCapabilityGuidance(
  vendor: ExternalAuthVendor,
  adapter: ApiEnv['AUTH_EXTERNAL_ADAPTER'],
) {
  return `${getExternalAuthGuidance(vendor)} Adapter mode: ${adapter}.`
}

export async function createMockExternalAuthToken(input: {
  secret: string
  vendor: ExternalAuthVendor
  subject: string
  workspaceId?: string
  email?: string
  issuer?: string
  audience?: string
  expiresInSeconds?: number
}) {
  const payload: Record<string, unknown> = {
    sub: input.subject,
  }

  if (input.workspaceId) {
    payload[
      input.vendor === 'clerk' ? 'org_id' : 'https://ai-war-room.dev/workspace_id'
    ] = input.workspaceId
  }

  if (input.email) {
    payload.email = input.email
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(input.subject)
    .setIssuedAt()
    .setExpirationTime(`${input.expiresInSeconds ?? 3_600}s`)
    .setIssuer(input.issuer ?? 'ai-war-room-external-auth')
    .setAudience(input.audience ?? 'ai-war-room-api')
    .sign(new TextEncoder().encode(input.secret))
}

async function decodeExternalAuthPayload(input: {
  token: string
  env: Pick<
    ApiEnv,
    | 'AUTH_EXTERNAL_ADAPTER'
    | 'AUTH_EXTERNAL_JWT_SECRET'
    | 'AUTH_EXTERNAL_JWKS_URL'
    | 'AUTH_EXTERNAL_ISSUER'
    | 'AUTH_EXTERNAL_AUDIENCE'
  >
}) {
  const verifyOptions = {
    issuer: input.env.AUTH_EXTERNAL_ISSUER,
    audience: input.env.AUTH_EXTERNAL_AUDIENCE,
  }

  if (input.env.AUTH_EXTERNAL_ADAPTER === 'mock') {
    if (!input.env.AUTH_EXTERNAL_JWT_SECRET) {
      throw new Error('AUTH_EXTERNAL_JWT_SECRET is required for mock external auth.')
    }

    const result = await jwtVerify(
      input.token,
      new TextEncoder().encode(input.env.AUTH_EXTERNAL_JWT_SECRET),
      verifyOptions,
    )

    return result.payload as Record<string, unknown>
  }

  if (!input.env.AUTH_EXTERNAL_JWKS_URL) {
    throw new Error('AUTH_EXTERNAL_JWKS_URL is required for JWKS external auth.')
  }

  const jwks = createRemoteJWKSet(new URL(input.env.AUTH_EXTERNAL_JWKS_URL))
  const result = await jwtVerify(input.token, jwks, verifyOptions)

  return result.payload as Record<string, unknown>
}

export type { ExternalAuthIdentity }
