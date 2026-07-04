import { UnauthorizedException } from '@nestjs/common'
import { describe, expect, it } from 'vitest'
import { AuthService } from './auth.service.js'

function createAuthService(input: {
  authProvider?: 'headers' | 'bearer'
  authBearerToken?: string
}) {
  return new AuthService({
    get: (key: string) => {
      if (key === 'AUTH_PROVIDER') {
        return input.authProvider ?? 'headers'
      }

      if (key === 'AUTH_BEARER_TOKEN') {
        return input.authBearerToken
      }

      return undefined
    },
  } as never)
}

describe('AuthService', () => {
  it('reports header auth capabilities by default', () => {
    const service = createAuthService({})

    expect(service.getCapabilities()).toMatchObject({
      provider: 'headers',
      requiresBearerToken: false,
      workspaceHeadersRequired: true,
    })
  })

  it('reports bearer auth capabilities when configured', () => {
    const service = createAuthService({
      authProvider: 'bearer',
      authBearerToken: 'prod-token',
    })

    expect(service.getCapabilities()).toMatchObject({
      provider: 'bearer',
      requiresBearerToken: true,
    })
  })

  it('accepts requests in header auth mode without bearer tokens', () => {
    const service = createAuthService({ authProvider: 'headers' })

    expect(() =>
      service.assertApiAccess({
        headers: {},
      }),
    ).not.toThrow()
  })

  it('requires a valid bearer token in bearer auth mode', () => {
    const service = createAuthService({
      authProvider: 'bearer',
      authBearerToken: 'prod-token',
    })

    expect(() =>
      service.assertApiAccess({
        headers: {
          authorization: 'Bearer prod-token',
        },
      }),
    ).not.toThrow()

    expect(() =>
      service.assertApiAccess({
        headers: {
          authorization: 'Bearer wrong-token',
        },
      }),
    ).toThrow(UnauthorizedException)
  })
})
