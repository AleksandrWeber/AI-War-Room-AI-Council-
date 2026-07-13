import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import {
  type AuthContext,
  type ManagedProviderId,
  type MaskedProviderCredential,
  type ProviderCredentialListResponse,
  type ProviderCredentialTestResponse,
  type UpsertProviderCredentialRequest,
  maskedProviderCredentialSchema,
  providerCredentialListResponseSchema,
  providerCredentialTestResponseSchema,
  upsertProviderCredentialRequestSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { ProviderCredentialEncryptionService } from './provider-credential-encryption.service.js'
import {
  PROVIDER_CREDENTIAL_REPOSITORY,
  type ProviderCredentialRecord,
  type ProviderCredentialRepository,
} from './provider-credential.repository.js'
import { ProviderCredentialTesterService } from './provider-credential-tester.service.js'

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

@Injectable()
export class ProviderCredentialsService {
  constructor(
    @Inject(PROVIDER_CREDENTIAL_REPOSITORY)
    private readonly providerCredentialRepository: ProviderCredentialRepository,
    private readonly encryptionService: ProviderCredentialEncryptionService,
    private readonly testerService: ProviderCredentialTesterService,
    private readonly configService: ConfigService<ApiEnv, true>,
  ) {}

  async listCredentials(
    authContext: AuthContext,
  ): Promise<ProviderCredentialListResponse> {
    const credentials =
      await this.providerCredentialRepository.listByWorkspace(
        authContext.workspaceId,
      )

    return providerCredentialListResponseSchema.parse({
      workspaceId: authContext.workspaceId,
      credentials: credentials.map((credential) =>
        this.toMaskedCredential(credential),
      ),
      needsProviderKey: this.needsProviderKey(credentials),
      instructions: this.getInstructions(),
    })
  }

  async upsertCredential(input: {
    authContext: AuthContext
    payload: UpsertProviderCredentialRequest
    credentialId?: string
  }): Promise<MaskedProviderCredential> {
    this.assertCanManage(input.authContext)
    const payload = upsertProviderCredentialRequestSchema.parse(input.payload)
    const existing = input.credentialId
      ? await this.providerCredentialRepository.findById(
          input.authContext.workspaceId,
          input.credentialId,
        )
      : null

    if (input.credentialId && !existing) {
      throw new NotFoundException({ message: 'Provider credential not found.' })
    }

    if (existing && existing.providerId !== payload.providerId) {
      throw new BadRequestException({
        message: 'Provider cannot be changed when editing an existing key.',
      })
    }

    const now = new Date().toISOString()
    const credential = await this.providerCredentialRepository.save({
      credentialId: existing?.credentialId ?? createId('provider_credential'),
      workspaceId: input.authContext.workspaceId,
      providerId: payload.providerId,
      label: payload.label,
      encryptedApiKey: this.encryptionService.encrypt(payload.apiKey),
      keyHint: this.maskKey(payload.apiKey),
      createdByUserId: input.authContext.userId,
      now,
    })

    return this.toMaskedCredential(credential)
  }

  async deleteCredential(input: {
    authContext: AuthContext
    credentialId: string
  }): Promise<{ deleted: true }> {
    this.assertCanManage(input.authContext)
    const deleted = await this.providerCredentialRepository.delete(
      input.authContext.workspaceId,
      input.credentialId,
    )

    if (!deleted) {
      throw new NotFoundException({ message: 'Provider credential not found.' })
    }

    return { deleted: true }
  }

  async testCredential(input: {
    authContext: AuthContext
    credentialId: string
  }): Promise<ProviderCredentialTestResponse> {
    this.assertCanManage(input.authContext)
    const credential = await this.providerCredentialRepository.findById(
      input.authContext.workspaceId,
      input.credentialId,
    )

    if (!credential) {
      throw new NotFoundException({ message: 'Provider credential not found.' })
    }

    const testedAt = new Date().toISOString()

    try {
      await this.testerService.testCredential({
        providerId: credential.providerId,
        apiKey: this.encryptionService.decrypt(credential.encryptedApiKey),
      })
      await this.providerCredentialRepository.updateTestResult({
        workspaceId: input.authContext.workspaceId,
        credentialId: input.credentialId,
        testedAt,
        status: 'passed',
      })

      return providerCredentialTestResponseSchema.parse({
        credentialId: input.credentialId,
        providerId: credential.providerId,
        status: 'passed',
        message: 'Connection test passed.',
        testedAt,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Connection test failed.'
      await this.providerCredentialRepository.updateTestResult({
        workspaceId: input.authContext.workspaceId,
        credentialId: input.credentialId,
        testedAt,
        status: 'failed',
        errorMessage: message,
      })

      return providerCredentialTestResponseSchema.parse({
        credentialId: input.credentialId,
        providerId: credential.providerId,
        status: 'failed',
        message,
        testedAt,
      })
    }
  }

  async resolveApiKey(input: {
    workspaceId?: string
    providerId: ManagedProviderId
  }): Promise<string | null> {
    if (!input.workspaceId) {
      return null
    }

    const credential = await this.providerCredentialRepository.findByProvider(
      input.workspaceId,
      input.providerId,
    )

    return credential
      ? this.encryptionService.decrypt(credential.encryptedApiKey)
      : null
  }

  getInstructions() {
    return {
      anthropic: {
        label: 'Anthropic',
        url: 'https://console.anthropic.com/settings/keys',
        steps: [
          'Open Anthropic Console.',
          'Go to Settings -> API Keys.',
          'Create a new key and copy it once.',
          'Paste it here. The browser will not store or display it again.',
        ],
      },
      openai: {
        label: 'OpenAI',
        url: 'https://platform.openai.com/api-keys',
        steps: [
          'Open OpenAI Platform.',
          'Go to API Keys.',
          'Create a new secret key and copy it once.',
          'Paste it here. The backend stores only an encrypted copy.',
        ],
      },
      gemini: {
        label: 'Google Gemini',
        url: 'https://aistudio.google.com/apikey',
        steps: [
          'Open Google AI Studio.',
          'Create or copy an API key.',
          'Paste it here for workspace Gemini BYOK.',
          'Platform GEMINI_API_KEY remains the fallback when no workspace key is set.',
        ],
      },
      tavily: {
        label: 'Tavily (research)',
        url: 'https://app.tavily.com/home',
        steps: [
          'Open the Tavily dashboard.',
          'Create or copy an API key.',
          'Paste it here for workspace Market Research BYOK.',
          'Platform TAVILY_API_KEY remains the fallback when no workspace key is set.',
        ],
      },
      serper: {
        label: 'Serper (research failover)',
        url: 'https://serper.dev/api-key',
        steps: [
          'Open Serper and copy an API key.',
          'Paste it here for research failover BYOK.',
          'Platform SERPER_API_KEY remains the fallback when no workspace key is set.',
        ],
      },
    }
  }

  private assertCanManage(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message: 'Only workspace owners and admins can manage provider keys.',
    })
  }

  private needsProviderKey(credentials: ProviderCredentialRecord[]) {
    const hasWorkspaceCredential = credentials.length > 0
    const hasSystemCredential = Boolean(
      this.configService.get('ANTHROPIC_API_KEY', { infer: true }) ||
        this.configService.get('OPENAI_API_KEY', { infer: true }) ||
        this.configService.get('GEMINI_API_KEY', { infer: true }),
    )

    return !hasWorkspaceCredential && !hasSystemCredential
  }

  private toMaskedCredential(
    credential: ProviderCredentialRecord,
  ): MaskedProviderCredential {
    return maskedProviderCredentialSchema.parse({
      credentialId: credential.credentialId,
      workspaceId: credential.workspaceId,
      providerId: credential.providerId,
      label: credential.label,
      maskedKey: credential.keyHint,
      createdByUserId: credential.createdByUserId,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
      lastTestedAt: credential.lastTestedAt,
      lastTestStatus: credential.lastTestStatus,
      lastTestError: credential.lastTestError,
    })
  }

  private maskKey(apiKey: string) {
    const suffix = apiKey.slice(-4)

    return apiKey.startsWith('sk-') ? `sk-...${suffix}` : `...${suffix}`
  }
}
