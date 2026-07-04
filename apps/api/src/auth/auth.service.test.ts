import { UnauthorizedException } from '@nestjs/common'
import { describe, expect, it, vi } from 'vitest'
import { AuthService } from './auth.service.js'
import type { ExternalAuthService } from './external-auth.service.js'

function createAuthService(input: {
  authProvider?: 'headers' | 'bearer' | 'session' | 'external'
  authBearerToken?: string
  nodeEnv?: 'development' | 'test' | 'production'
  sessionSecret?: string
  sessionTtlSeconds?: number
  externalVendor?: 'clerk' | 'auth0'
  externalAdapter?: 'mock' | 'jwks'
  externalIdentity?: {
    userId: string
    workspaceId?: string
    vendor: 'clerk' | 'auth0'
    subject: string
  }
}) {
  const externalAuthService = {
    verifyToken: vi.fn(async () => {
      if (!input.externalIdentity) {
        throw new Error('Missing external identity mock.')
      }

      return {
        ...input.externalIdentity,
        vendor: input.externalIdentity.vendor,
        subject: input.externalIdentity.subject,
      }
    }),
  } as unknown as ExternalAuthService

  return new AuthService(
    {
      get: (key: string) => {
        if (key === 'AUTH_PROVIDER') {
          return input.authProvider ?? 'headers'
        }

        if (key === 'AUTH_BEARER_TOKEN') {
          return input.authBearerToken
        }

        if (key === 'NODE_ENV') {
          return input.nodeEnv ?? 'test'
        }

        if (key === 'APP_ENCRYPTION_KEY') {
          return input.sessionSecret ?? 'test-session-secret-key'
        }

        if (key === 'AUTH_SESSION_TTL_SECONDS') {
          return input.sessionTtlSeconds ?? 3_600
        }

        if (key === 'AUTH_EXTERNAL_VENDOR') {
          return input.externalVendor ?? 'clerk'
        }

        if (key === 'AUTH_EXTERNAL_ADAPTER') {
          return input.externalAdapter ?? 'mock'
        }

        if (key === 'AUTH_EXTERNAL_AUTO_PROVISION') {
          return input.authProvider === 'external'
        }

        return undefined
      },
    } as never,
    externalAuthService,
  )
}

describe('AuthService', () => {
  it('reports header auth capabilities by default', () => {
    const service = createAuthService({})

    expect(service.getCapabilities()).toMatchObject({
      provider: 'headers',
      requiresBearerToken: false,
      supportsSessionBootstrap: true,
      supportsExternalProvisioning: false,
      externalVendor: null,
      externalAdapter: null,
    })
  })

  it('reports external auth capabilities when configured', () => {
    const service = createAuthService({
      authProvider: 'external',
      externalVendor: 'auth0',
      externalAdapter: 'jwks',
    })

    expect(service.getCapabilities()).toMatchObject({
      provider: 'external',
      requiresBearerToken: true,
      supportsSessionBootstrap: false,
      supportsExternalProvisioning: true,
      workspaceHeadersRequired: false,
      externalVendor: 'auth0',
      externalAdapter: 'jwks',
    })
  })

  it('accepts requests in header auth mode without bearer tokens', async () => {
    const service = createAuthService({ authProvider: 'headers' })

    await expect(
      service.assertApiAccess({
        headers: {},
      }),
    ).resolves.toBeUndefined()
  })

  it('requires a valid bearer token in bearer auth mode', async () => {
    const service = createAuthService({
      authProvider: 'bearer',
      authBearerToken: 'prod-token',
    })

    await expect(
      service.assertApiAccess({
        headers: {
          authorization: 'Bearer prod-token',
        },
      }),
    ).resolves.toBeUndefined()

    await expect(
      service.assertApiAccess({
        headers: {
          authorization: 'Bearer wrong-token',
        },
      }),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('stores verified session claims in session auth mode', async () => {
    const service = createAuthService({
      authProvider: 'session',
      sessionSecret: 'test-session-secret-key',
    })
    const session = service.createSession({
      userId: 'user_test',
      workspaceId: 'workspace_1',
    })
    const request = {
      headers: {
        authorization: `Bearer ${session.token}`,
      },
    }

    await service.assertApiAccess(request)

    expect(service.resolveSessionClaims(request)).toMatchObject({
      userId: 'user_test',
      workspaceId: 'workspace_1',
    })
  })

  it('stores verified external identities in external auth mode', async () => {
    const service = createAuthService({
      authProvider: 'external',
      externalIdentity: {
        userId: 'clerk_user_external',
        workspaceId: 'workspace_1',
        vendor: 'clerk',
        subject: 'user_external',
      },
    })
    const request = {
      headers: {
        authorization: 'Bearer external-token',
      },
    }

    await service.assertApiAccess(request)

    expect(service.resolveAuthIdentity(request)).toMatchObject({
      userId: 'clerk_user_external',
      workspaceId: 'workspace_1',
    })
  })

  it('creates signed session responses', () => {
    const service = createAuthService({
      sessionSecret: 'test-session-secret-key',
      sessionTtlSeconds: 1_800,
    })

    expect(
      service.createSession({
        userId: 'user_local',
        workspaceId: 'local_workspace',
      }),
    ).toMatchObject({
      userId: 'user_local',
      workspaceId: 'local_workspace',
      expiresAt: expect.any(Number),
      token: expect.any(String),
    })
  })

  it('requires bootstrap bearer tokens in production bearer mode', () => {
    const service = createAuthService({
      authProvider: 'bearer',
      authBearerToken: 'prod-token',
      nodeEnv: 'production',
    })

    expect(() =>
      service.assertSessionBootstrapAccess({
        headers: {},
      }),
    ).toThrow(UnauthorizedException)

    expect(() =>
      service.assertSessionBootstrapAccess({
        headers: {
          authorization: 'Bearer prod-token',
        },
      }),
    ).not.toThrow()
  })
})
