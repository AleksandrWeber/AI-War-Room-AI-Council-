import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  authCapabilitiesResponseSchema,
  getAuthProviderGuidance,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import type { AuthenticatedRequest } from './workspace-access.guard.js'

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  getCapabilities() {
    const provider = this.configService.get('AUTH_PROVIDER', { infer: true })

    return authCapabilitiesResponseSchema.parse({
      provider,
      requiresBearerToken: provider === 'bearer',
      workspaceHeadersRequired: true,
      guidance: getAuthProviderGuidance(provider),
    })
  }

  assertApiAccess(request: AuthenticatedRequest) {
    const provider = this.configService.get('AUTH_PROVIDER', { infer: true })

    if (provider === 'headers') {
      return
    }

    const bearerToken = this.configService.get('AUTH_BEARER_TOKEN', {
      infer: true,
    })
    const authorization = this.getSingleHeader(request.headers.authorization)

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        message: 'Missing Authorization bearer token.',
      })
    }

    const token = authorization.slice('Bearer '.length).trim()

    if (!token || token !== bearerToken) {
      throw new UnauthorizedException({
        message: 'Invalid Authorization bearer token.',
      })
    }
  }

  private getSingleHeader(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value
  }
}
