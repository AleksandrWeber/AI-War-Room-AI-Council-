import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProviderCredentialsRolloutGuidance,
  providerCredentialsCapabilitiesResponseSchema,
  providerKeyAdminActionRequestSchema,
  providerKeyAdminActionResponseSchema,
  providerKeyAdminSummaryResponseSchema,
  providerCredentialsRolloutResponseSchema,
  type AuthContext,
  type MaskedProviderCredential,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { ProviderCredentialEncryptionService } from './provider-credential-encryption.service.js'
import { evaluateProviderCredentialsRollout } from './provider-credentials-rollout.helpers.js'
import { ProviderCredentialsService } from './provider-credentials.service.js'
import {
  buildProviderKeyAdminStats,
  getProviderKeyAdminGuidance,
  resolveProviderKeyAdminActions,
} from './provider-key-admin.helpers.js'

@Injectable()
export class ProviderCredentialsAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly providerCredentialsService: ProviderCredentialsService,
    private readonly encryptionService: ProviderCredentialEncryptionService,
  ) {}

  getCapabilities() {
    return providerCredentialsCapabilitiesResponseSchema.parse({
      supportsProviderCredentialsRollout: true,
      supportsProviderKeyAdminTools: true,
      managedProviders: ['anthropic', 'openai'],
      guidance: getProviderCredentialsRolloutGuidance(),
    })
  }

  getProviderCredentialsRollout() {
    const rollout = evaluateProviderCredentialsRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      appEncryptionKey: this.configService.get('APP_ENCRYPTION_KEY', {
        infer: true,
      }),
      encryptionRoundtripPassed: this.verifyEncryptionRoundtrip(),
      usesInMemoryRepository:
        this.configService.get('NODE_ENV', { infer: true }) === 'test',
      llmPrimaryProvider: this.configService.get('LLM_PRIMARY_PROVIDER', {
        infer: true,
      }),
      llmFallbackProvider: this.configService.get('LLM_FALLBACK_PROVIDER', {
        infer: true,
      }),
      anthropicApiKey: this.configService.get('ANTHROPIC_API_KEY', {
        infer: true,
      }),
      openaiApiKey: this.configService.get('OPENAI_API_KEY', { infer: true }),
    })

    return providerCredentialsRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProviderKeyAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProviderKeys(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const list = await this.providerCredentialsService.listCredentials(authContext)
    const stats = buildProviderKeyAdminStats(list.credentials)
    const availableActions = resolveProviderKeyAdminActions({ stats })

    return providerKeyAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      credentials: list.credentials,
      stats,
      availableActions,
      guidance: getProviderKeyAdminGuidance({ stats }),
    })
  }

  async executeProviderKeyAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'test_all_credentials' | 'retest_failed_credentials'
    },
  ) {
    this.assertCanManageProviderKeys(authContext)

    const payload = providerKeyAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const summary = await this.getWorkspaceProviderKeyAdminSummary(
      authContext,
      payload.workspaceId,
    )
    const credentialIds = this.resolveCredentialIdsForAction(
      payload.action,
      summary.credentials,
    )

    for (const credentialId of credentialIds) {
      await this.providerCredentialsService.testCredential({
        authContext,
        credentialId,
      })
    }

    const refreshed = await this.getWorkspaceProviderKeyAdminSummary(
      authContext,
      payload.workspaceId,
    )

    return providerKeyAdminActionResponseSchema.parse({
      workspaceId: payload.workspaceId,
      action: payload.action,
      message:
        credentialIds.length === 0
          ? 'No provider credentials matched the requested admin action.'
          : payload.action === 'retest_failed_credentials'
            ? `Retested ${credentialIds.length} failed provider credential(s).`
            : `Tested ${credentialIds.length} provider credential(s).`,
      stats: refreshed.stats,
    })
  }

  private resolveCredentialIdsForAction(
    action: 'test_all_credentials' | 'retest_failed_credentials',
    credentials: MaskedProviderCredential[],
  ) {
    if (action === 'retest_failed_credentials') {
      return credentials
        .filter((credential) => credential.lastTestStatus === 'failed')
        .map((credential) => credential.credentialId)
    }

    return credentials.map((credential) => credential.credentialId)
  }

  private verifyEncryptionRoundtrip() {
    try {
      const sample = 'provider-credentials-rollout-check'
      return this.encryptionService.decrypt(
        this.encryptionService.encrypt(sample),
      ) === sample
    } catch {
      return false
    }
  }

  private assertCanManageProviderKeys(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message: 'Only workspace owners and admins can manage provider keys.',
    })
  }
}
