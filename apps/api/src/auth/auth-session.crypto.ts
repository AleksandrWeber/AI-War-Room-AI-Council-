import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  authSessionClaimsSchema,
  authSessionResponseSchema,
  type AuthSessionClaims,
} from '@ai-war-room/schemas'

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signPayload(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createAuthSessionToken(input: {
  claims: AuthSessionClaims
  secret: string
}) {
  const payload = encodeBase64Url(JSON.stringify(input.claims))
  const signature = signPayload(payload, input.secret)

  return `${payload}.${signature}`
}

export function verifyAuthSessionToken(input: {
  token: string
  secret: string
  now?: number
}) {
  const [payload, signature] = input.token.split('.')

  if (!payload || !signature) {
    throw new Error('Malformed auth session token.')
  }

  const expectedSignature = signPayload(payload, input.secret)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid auth session token signature.')
  }

  const claims = authSessionClaimsSchema.parse(
    JSON.parse(decodeBase64Url(payload)),
  )
  const now = input.now ?? Math.floor(Date.now() / 1_000)

  if (claims.exp <= now) {
    throw new Error('Auth session token has expired.')
  }

  return claims
}

export function buildAuthSessionResponse(input: {
  userId: string
  workspaceId: string
  secret: string
  ttlSeconds: number
  now?: number
}) {
  const now = input.now ?? Math.floor(Date.now() / 1_000)
  const expiresAt = now + input.ttlSeconds
  const token = createAuthSessionToken({
    secret: input.secret,
    claims: {
      userId: input.userId,
      workspaceId: input.workspaceId,
      exp: expiresAt,
    },
  })

  return authSessionResponseSchema.parse({
    token,
    expiresAt,
    userId: input.userId,
    workspaceId: input.workspaceId,
  })
}
