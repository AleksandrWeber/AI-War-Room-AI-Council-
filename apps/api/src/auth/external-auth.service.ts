import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ExternalAuthIdentity } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { verifyExternalAuthToken } from './external-auth.adapter.js'

@Injectable()
export class ExternalAuthService {
  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  async verifyToken(token: string): Promise<ExternalAuthIdentity> {
    try {
      return await verifyExternalAuthToken({
        token,
        env: {
          AUTH_EXTERNAL_ADAPTER: this.configService.get(
            'AUTH_EXTERNAL_ADAPTER',
            { infer: true },
          ),
          AUTH_EXTERNAL_VENDOR: this.configService.get('AUTH_EXTERNAL_VENDOR', {
            infer: true,
          }),
          AUTH_EXTERNAL_JWT_SECRET: this.configService.get(
            'AUTH_EXTERNAL_JWT_SECRET',
            { infer: true },
          ),
          AUTH_EXTERNAL_JWKS_URL: this.configService.get(
            'AUTH_EXTERNAL_JWKS_URL',
            { infer: true },
          ),
          AUTH_EXTERNAL_ISSUER: this.configService.get('AUTH_EXTERNAL_ISSUER', {
            infer: true,
          }),
          AUTH_EXTERNAL_AUDIENCE: this.configService.get(
            'AUTH_EXTERNAL_AUDIENCE',
            { infer: true },
          ),
          AUTH_EXTERNAL_USER_ID_CLAIM: this.configService.get(
            'AUTH_EXTERNAL_USER_ID_CLAIM',
            { infer: true },
          ),
          AUTH_EXTERNAL_WORKSPACE_ID_CLAIM: this.configService.get(
            'AUTH_EXTERNAL_WORKSPACE_ID_CLAIM',
            { infer: true },
          ),
        },
      })
    } catch (error) {
      throw new UnauthorizedException({
        message:
          error instanceof Error
            ? error.message
            : 'Invalid external auth token.',
      })
    }
  }
}
